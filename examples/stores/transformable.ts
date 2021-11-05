import { Action, Store, Request, StoreLink, Subscriber, isBrowser } from "co-share"
import { History } from "co-share/utils"
import { of } from "rxjs"
import { tap } from "rxjs/operators"
import create, { StoreApi } from "zustand/vanilla"

export class TransformableStore extends Store {
    public state: StoreApi<{ matrix: Array<number>; owner: string }>
    private history: History<{ matrix: Array<number>; owner: string }>

    public onUnlink(link: StoreLink): void {
        if (this.history.presence.owner === link.connection.userData.id) {
            this.forceLock("none")
            this.forceLock.publishTo({ to: "all" }, "none")
        }
    }

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber<TransformableStore, [Array<number>, string]> = Subscriber.create(
        TransformableStore,
        (connection, accept, deny) => {
            const s = this.state.getState()
            accept(s.matrix, s.owner)
        }
    )

    constructor(matrix: Array<number>, owner: string) {
        super()
        this.state = create(() => ({ matrix, owner }))
        this.history = new History(this.state.getState(), (presence) => this.state.setState(presence))
    }

    setLock: Request<this, [string], boolean> = Request.create(this, "setSliderLock", (origin, owner: string) => {
        if (origin != null) {
            this.forceLock(owner)
            this.forceLock.publishTo({ to: "all-except-one", except: origin }, owner)
            return of(true)
        } else {
            const resolve = this.history.maybeNext(({ matrix }) => ({ owner, matrix }))
            return this.setLock.publishTo(this.mainLink, owner).pipe(tap((keep) => resolve(keep)))
        }
    })

    private forceLock = Action.create(this, "forceLock", (origin, owner: string) => {
        this.history.next(({ matrix }) => ({
            owner,
            matrix,
        }))
    })

    transform = Action.create(this, "transform", (origin, by: string, matrix: Array<number>) => {
        this.history.next((state) => {
            if (state.owner != by) {
                return state
            }
            return {
                owner: state.owner,
                matrix,
            }
        })

        if (this.history.presence.owner != by) {
            return
        }

        this.transform.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, by, matrix)
    })
}
