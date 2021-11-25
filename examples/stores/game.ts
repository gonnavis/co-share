import { Action, Store, StoreLink, Subscriber } from "co-share"
import { Universe } from "co-consistent"
import { Euler, Vector3, Vector3Tuple } from "three"
import { WalkDirection } from "../components/useFPSControls"
import { vec3Copy, vec3Add, vec3MultScalar, vec3DivideScalar, vec3Sub, vec3LimitLength } from "../components/math"

const helperVector = new Vector3()
const helperEuler = new Euler()
const vec3Helper: Vector3Tuple = [0, 0, 0]

export const moveSpeed = 0.02
const physicTickTime = 20 //ms

export enum ActionType {
    Move,
    Rotate,
    Unlock,
    Jump,
    Join,
    Leave,
    Init,
}

type MoveAction = {
    type: ActionType.Move
    direction: WalkDirection
    move: boolean
}

type UnlockAction = {
    type: ActionType.Unlock
}

type RotateAction = {
    type: ActionType.Rotate
    x: number
    y: number
}

type JumpAction = {
    type: ActionType.Jump
}

type JoinAction = {
    type: ActionType.Join
}

type LeaveAction = {
    type: ActionType.Leave
}

type InitAction = {
    type: ActionType.Init
    state: State
}

export type StateAction = (
    | ((MoveAction | RotateAction | UnlockAction | JumpAction | JoinAction | LeaveAction) & {
          playerId: string
      })
    | InitAction
) & {
    id: number
}

export type State = {
    [PlayerId in string]: {
        isOnGround: boolean
        timeSinceLastUpdate: number
        rotation: Vector3Tuple
        position: Vector3Tuple
        velocity: Vector3Tuple
    } & {
        [walkDirection in WalkDirection]: boolean
    }
}

export class GameStore extends Store {
    subscriber: Subscriber<Store, [time: number, playerId: string | undefined, state: State]> = Subscriber.create(
        GameStore,
        (connection, accept) => {
            const time = this.universe.getCurrentTime()
            const state: State = {}
            this.universe.applyStateAt(state, this.universe.history[this.universe.history.length - 1], time)
            accept(time, connection.userData.id, state)
        }
    )

    private universe: Universe<State, StateAction>
    private playerId: string | undefined

    constructor(time: number, playerId: string | undefined, state: State) {
        super()
        this.playerId = playerId
        this.universe = new Universe(
            time,
            () => window.performance.now(),
            (base, deltaTime, action, cachedDetlaTime, cachedBase, cachedResult) => {
                //TODO: fixResult
            },
            (a1, a2) => a1.id - a2.id,
            (from, to) => {
                Object.keys(to).forEach((key) => {
                    delete to[key]
                })
                Object.entries(from).forEach(([key, from]) => copyState(from, (to[key] = {} as any)))
            },
            2000
        )
        //TODO: insert the whole history but do not recompute the state
        this.universe.insert({
            type: ActionType.Init,
            id: Math.random(),
            state,
        })
    }

    move = Action.create(this, "move", (origin, move: boolean, direction: WalkDirection, externalPlayerId?: string) => {
        //move
        const playerId = getPlayerId(origin, this.playerId, externalPlayerId)
        this.universe.insert({
            type: ActionType.Move,
            direction,
            id: Math.random(),
            move,
            playerId,
        })
        this.move.publishTo(
            origin == null ? { to: "all" } : { to: "all-except-one", except: origin },
            move,
            direction,
            playerId
        )
    })

    rotate = Action.create(this, "rotate", (origin, x: number, y: number, externalPlayerId?: string) => {
        //rotate
        const playerId = getPlayerId(origin, this.playerId, externalPlayerId)
        this.universe.insert({
            type: ActionType.Rotate,
            x,
            y,
            id: Math.random(),
            playerId,
        })
        this.rotate.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, x, y, playerId)
    })

    jump = Action.create(this, "jump", (origin, externalPlayerId?: string) => {
        //jump
        const playerId = getPlayerId(origin, this.playerId, externalPlayerId)
        this.universe.insert({
            type: ActionType.Jump,
            id: Math.random(),
            playerId,
        })
        this.jump.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, playerId)
    })

    unlock = Action.create(this, "unlock", (origin, externalPlayerId?: string) => {
        //lock
        const playerId = getPlayerId(origin, this.playerId, externalPlayerId)
        this.universe.insert({
            type: ActionType.Unlock,
            id: Math.random(),
            playerId,
        })
        this.unlock.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, playerId)
    })

    join = Action.create(this, "join", (origin, playerId: string) => {
        //join
        this.universe.insert({
            type: ActionType.Join,
            id: Math.random(),
            playerId,
        })
        this.join.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, playerId)
    })

    leave = Action.create(this, "leave", (origin, playerId: string) => {
        //leave
        this.universe.insert({
            type: ActionType.Leave,
            id: Math.random(),
            playerId,
        })
        this.leave.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, playerId)
    })

    onLink(link: StoreLink): void {
        //disconnect
        if (this.playerId == null) {
            this.join(link.connection.userData.id)
        }
    }

    onUnlink(link: StoreLink): void {
        if (this.playerId == null) {
            this.leave(link.connection.userData.id)
        }
    }
}

function getPlayerId(
    origin: StoreLink | undefined,
    ownPlayerId: string | undefined,
    playerId: string | undefined
): string {
    if (origin == null) {
        if (ownPlayerId == null) {
            throw "move can't be executed locally on the server"
        }
        return ownPlayerId
    } else {
        if (playerId == null) {
            throw "move must provide a playerId when published"
        }
        return playerId
    }
}

export function copyState(from: State[string], to: Partial<State[string]>): void {
    vec3Copy(from.position, (to.position = to.position ?? [0, 0, 0]))
    vec3Copy(from.rotation, (to.rotation = to.rotation ?? [0, 0, 0]))
    vec3Copy(from.velocity, (to.velocity = to.velocity ?? [0, 0, 0]))

    to[WalkDirection.BACKWARD] = from[WalkDirection.BACKWARD]
    to[WalkDirection.RIGHT] = from[WalkDirection.RIGHT]
    to[WalkDirection.LEFT] = from[WalkDirection.LEFT]
    to[WalkDirection.FORWRD] = from[WalkDirection.FORWRD]

    to.timeSinceLastUpdate = from.timeSinceLastUpdate
    to.isOnGround = from.isOnGround
}

export function reduce(ref: State[string], state: State[string], action: StateAction): void {
    if (action.type === ActionType.Rotate) {
        ref.rotation[0] = Math.min(Math.max(state.rotation[0] + action.x, -Math.PI / 2), Math.PI / 2)
        ref.rotation[1] = state.rotation[1] + action.y
        updateVelocity(ref, state)
    } else if (action.type === ActionType.Unlock) {
        state[WalkDirection.BACKWARD] = false
        state[WalkDirection.RIGHT] = false
        state[WalkDirection.LEFT] = false
        state[WalkDirection.FORWRD] = false
        updateVelocity(ref, state)
    } else if (action.type === ActionType.Move) {
        state[action.direction] = action.move
        updateVelocity(ref, state)
    } else {
        if (state.isOnGround) {
            ref.velocity[1] = 0.01
        }
    }
}

function updateVelocity(ref: State[string], state: State[string]): void {
    helperEuler.set(...state.rotation)
    helperEuler.x = 0
    let x = 0
    let z = 0
    if (state[WalkDirection.FORWRD]) {
        z--
    }
    if (state[WalkDirection.BACKWARD]) {
        z++
    }
    if (state[WalkDirection.RIGHT]) {
        x++
    }
    if (state[WalkDirection.LEFT]) {
        x--
    }

    helperVector.set(x, 0, z).applyEuler(helperEuler).multiplyScalar(moveSpeed)
    ref.velocity[0] = helperVector.x
    ref.velocity[2] = helperVector.z
}

export function createPlayerState(): State[string] {
    return {
        [WalkDirection.BACKWARD]: false,
        [WalkDirection.RIGHT]: false,
        [WalkDirection.LEFT]: false,
        [WalkDirection.FORWRD]: false,
        timeSinceLastUpdate: 0,
        position: [0, 2, 0],
        rotation: [0, 0, 0],
        velocity: [0, 0, 0],
        isOnGround: false,
    }
}

export function extrapolateState(
    cache: StateCache<State[string]>,
    resolveCollision: React.RefObject<(position: Vector3Tuple, radius: number) => boolean>,
    ref: State[string],
    state: State[string],
    time: number
) {
    if (state != cache.baseState || cache.time > time) {
        cache.baseState = state
        cache.time = 0
        copyState(cache.baseState, cache.state)
    }
    cache.state.timeSinceLastUpdate = state.timeSinceLastUpdate + time - cache.time
    while (cache.state.timeSinceLastUpdate >= physicTickTime) {
        cache.time += physicTickTime
        cache.state.timeSinceLastUpdate -= physicTickTime
        extrapolateStateStep(cache.state, physicTickTime, resolveCollision.current!)
    }
    copyState(cache.state, ref)
}

function extrapolateStateStep(
    ref: State[string],
    time: number,
    resolveCollision: (position: Vector3Tuple, radius: number) => boolean
): void {
    ref.velocity[1] -= 0.00003 * time

    ref.position[0] += ref.velocity[0] * time
    ref.position[1] += ref.velocity[1] * time
    ref.position[2] += ref.velocity[2] * time

    vec3Add(ref.position, vec3MultScalar(ref.velocity, time, vec3Helper), ref.position)

    if (resolveCollision(ref.position, 3)) {
        //collision
        ref.isOnGround = true
        ref.velocity[1] = 0
    } else {
        ref.isOnGround = false
    }
}

export function applySmoothing(
    smoothState: State[string],
    smoothStateTime: number,
    realState: State[string],
    realStateTime: number
): void {
    const deltaTime = realStateTime - smoothStateTime
    const velocityReal = realState.velocity
    const valueReal = realState.position
    const valueSmoothed = smoothState.position

    //const vd = (velocityReal + (0.05 * (valueReal - valueSmoothed)) / deltaTime) / 1.05
    const vd = vec3DivideScalar(
        vec3Add(
            velocityReal,
            vec3MultScalar(vec3Sub(valueReal, valueSmoothed, vec3Helper), 0.05 / deltaTime, vec3Helper),
            vec3Helper
        ),
        1.05,
        vec3Helper
    )

    //smoothState.velocity += limitAbs(vd - smoothState.velocity, velocity * deltaTime * 0.1)
    vec3Add(
        smoothState.velocity,
        vec3LimitLength(vec3Sub(vd, smoothState.velocity, vec3Helper), moveSpeed * deltaTime * 0.001, vec3Helper),
        smoothState.velocity
    )

    //smoothState.value += smoothState.velocity * deltaTime
    vec3Add(smoothState.position, vec3MultScalar(smoothState.velocity, deltaTime, vec3Helper), smoothState.position)

    vec3Copy(realState.rotation, smoothState.rotation)
}
