import { State, Universe } from "co-consistent"
import { Action, Store, StoreLink, Subscriber } from "co-share"

export class ConsistentStore extends Store {
    subscriber: Subscriber<Store, [time: number, value: number, directionInverted: boolean]> = Subscriber.create(
        ConsistentStore,
        (connection, accept) => {
            const time = this.clock.getCurrentTime()
            const entry = this.universe.history[this.universe.history.length - 1]
            this.universe.applyStateAt(this.realStateRef, entry, time)
            accept(time, this.realStateRef.value, this.realStateRef.directionInverted)
        }
    )

    private readonly universe: Universe<ContinousState>
    public readonly clock: WarpableClock

    public readonly smoothedRef: { state: SmoothState | undefined; time: number | undefined } = {
        state: undefined,
        time: undefined,
    }
    private realStateRef = new ContinousState(0, false)

    constructor(private readonly onServer: boolean, time: number, value: number, directionInverted: boolean) {
        super()
        this.clock = new WarpableClock(time, () => (global.window == null ? 0 : window.performance.now()))
        this.universe = new Universe(
            () => new ContinousState(0, false),
            (a1, a2) => a1.id - a2.id,
            2000
        )

        this.universe.insert(
            {
                id: Math.random(),
                type: "init",
            },
            time,
            time,
            new ContinousState(value, directionInverted)
        )
    }

    warpTime = Action.create(this, "changeTime", (origin, by: number) => this.clock.jump(by))

    informTime = Action.create(this, "informTime", (origin, currentTime?: number) => {
        if (origin == null) {
            this.informTime.publishTo({ to: "one", one: this.mainLink }, this.clock.getCurrentTime())
        } else if (currentTime != null) {
            this.warpTime.publishTo({ to: "one", one: origin }, this.clock.getCurrentTime() - currentTime)
        }
    })

    invert = Action.create(this, "invert", async (origin, stateTime?: number, id?: number) => {
        let currentTime = this.clock.getCurrentTime()
        if (origin == null) {
            //local
            id = Math.random()
            stateTime = currentTime
        } else {
            if (stateTime == null || id == null) {
                return
            }
            this.warpTime.publishTo({ to: "one", one: origin }, currentTime - stateTime)
            if (stateTime > currentTime) {
                const jumpBy = stateTime - currentTime
                if (this.onServer) {
                    //the server's clock should not jump, therefore we delay the action insertion
                    await new Promise((resolve) => setTimeout(resolve, jumpBy))
                } else {
                    this.clock.jump(jumpBy)
                }
                currentTime = this.clock.getCurrentTime()
            }
        }
        if (this.smoothedRef.state != null && this.smoothedRef.time != null) {
            const deltaTime = currentTime - this.smoothedRef.time
            this.smoothedRef.state.value += this.smoothedRef.state.velocity * deltaTime
            this.smoothedRef.state.velocity = -this.smoothedRef.state.velocity
            this.smoothedRef.time = currentTime
        }
        this.universe.insert(
            {
                type: "invert",
                id,
            },
            currentTime,
            stateTime
        )
        this.invert.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, stateTime, id)
    })

    getCurrentValue(smoothed: boolean): number {
        const realStateTime = this.clock.getCurrentTime()
        const entry = this.universe.history[this.universe.history.length - 1]
        this.universe.applyStateAt(this.realStateRef, entry, realStateTime)
        let value: number
        if (this.smoothedRef.state == null || this.smoothedRef.time == null) {
            this.smoothedRef.state = {
                value: this.realStateRef.value,
                velocity: this.realStateRef.directionInverted ? -velocity : velocity,
            }
            value = this.realStateRef.value
        } else {
            applySmoothing(this.smoothedRef.state, this.smoothedRef.time, this.realStateRef, realStateTime)
            value = smoothed ? this.smoothedRef.state.value : this.realStateRef.value
        }
        this.smoothedRef.time = realStateTime
        const abs = Math.abs(value)
        const backwards = Math.floor(abs) % 2 === 1
        return backwards ? 1 - (abs % 1) : abs % 1
    }

    onUnlink(link: StoreLink): void {}
    onLink(link: StoreLink): void {}
}

const velocity = 0.0001

type StateAction = {
    type: "init" | "invert"
    id: number
}

type SmoothState = {
    value: number
    velocity: number
}

class ContinousState implements State<StateAction> {
    constructor(public value: number, public directionInverted: boolean) {}

    update(
        base: this | undefined,
        deltaTime: number,
        action: StateAction | undefined,
        prevDeltaTime: number | undefined,
        prevBase: this | undefined
    ): void {
        if (action?.type === "init" || base == null) {
            return
        }
        if (
            action?.type == "invert" &&
            base.directionInverted === prevBase?.directionInverted &&
            base.value === prevBase?.value &&
            prevDeltaTime === deltaTime
        ) {
            return
        }
        this.value = base.value + deltaTime * (base.directionInverted ? -velocity : velocity)
        this.directionInverted = action == null ? base.directionInverted : !base.directionInverted
    }

    copyFrom(ref: this): void {
        this.directionInverted = ref.directionInverted
        this.value = ref.value
    }
}

function applySmoothing(
    smoothState: SmoothState,
    smoothStateTime: number,
    realState: ContinousState,
    realStateTime: number
): void {
    const deltaTime = realStateTime - smoothStateTime
    const velocityReal = realState.directionInverted ? -velocity : velocity
    const valueReal = realState.value
    const valueSmoothed = smoothState.value

    const vd = (velocityReal + (0.05 * (valueReal - valueSmoothed)) / deltaTime) / 1.05
    smoothState.velocity += limitAbs(vd - smoothState.velocity, velocity * deltaTime * 0.1)

    smoothState.value += smoothState.velocity * deltaTime
}

function limitAbs(value: number, limit: number): number {
    return Math.max(-limit, Math.min(limit, value))
}

class WarpableClock {
    private realTimeAtStateTime: number
    private goalOffset: number | undefined
    private goalOffsetStartRealTime: number | undefined

    constructor(private stateTime: number, private readonly getRealTime: () => number) {
        this.realTimeAtStateTime = this.getRealTime()
    }

    private computeCurrentStateTime(realTime: number): number {
        let changeThroughGoal = 0
        if (this.goalOffset != null && this.goalOffsetStartRealTime != null) {
            const timeSinceGoalSet = Math.max(0, realTime - this.goalOffsetStartRealTime)
            timeSinceGoalSet * 0.1
            changeThroughGoal = Math.min(Math.abs(this.goalOffset), timeSinceGoalSet)
            if (this.goalOffset < 0) {
                changeThroughGoal = -changeThroughGoal
            }
        }
        return this.stateTime + (realTime - this.realTimeAtStateTime) + changeThroughGoal
    }

    getCurrentTime(): number {
        return this.computeCurrentStateTime(this.getRealTime())
    }

    waitUntil(time: number): Promise<void> {
        
    }

    jump(by: number): void {
        if (by < 0) {
            const newRealTime = this.getRealTime()
            this.stateTime = this.computeCurrentStateTime(newRealTime)
            this.realTimeAtStateTime = newRealTime
            this.goalOffsetStartRealTime = newRealTime
            this.goalOffset = by
        } else {
            this.goalOffset = undefined
            this.goalOffsetStartRealTime = undefined
            this.stateTime += by
        }
    }
}
