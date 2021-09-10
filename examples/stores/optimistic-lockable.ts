import { Action, Request, Store, StoreLink, Subscriber } from "co-share"
import { History } from "co-share/utils"
import { of } from "rxjs"
import { tap } from "rxjs/operators"
import { StoreApi } from "zustand"
import create from "zustand/vanilla"

export class OptimisticLockableStore extends Store {
    public state: StoreApi<{ value: number; owner: string }>
    private history: History<{ value: number; owner: string }>

    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber = Subscriber.create(OptimisticLockableStore, (connection, accept, deny) => {
        const s = this.state.getState()
        accept(s.value, s.owner)
    })

    constructor(value: number, owner: string) {
        super()
        this.state = create(() => ({ value, owner }))
        this.history = new History(this.state.getState(), (presence) => this.state.setState(presence))
    }

    setSliderLock: Request<[string], boolean> = Request.create(this, "setSliderLock", (origin, owner: string) => {
        if (origin != null) {
            if (Math.random() > 0.5) {
                this.history.next(({ value }) => ({
                    owner,
                    value,
                }))
                this.forceSliderLock.publishTo({ to: "all-except-one", except: origin }, owner)
                return of(true)
            }
            return of(false)
        } else {
            const resolve = this.history.maybeNext(({ value }) => ({ owner, value }))
            return this.setSliderLock.publishTo(this.links[0], owner).pipe(tap((keep) => resolve(keep)))
        }
    })

    private forceSliderLock = Action.create(this, "forceSliderLock", (origin, owner: string) => {
        this.history.next(({ value }) => ({
            owner,
            value,
        }))
    })

    setSlider = Action.create(this, "setSlider", (origin, by: string, value: number) => {
        this.history.next((state) => {
            if (state.owner != by) {
                return state
            }
            return {
                owner: state.owner,
                value,
            }
        })

        if (this.history.presence.owner != by) {
            return
        }

        this.setSlider.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, by, value)
    })
}
