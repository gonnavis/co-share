# Optimistic Lockable Example

A variant of the Lockable.  
To achieve a better experience for the clients, it is beneficial to assume things like locks are granted before the server responds to get a more fluid user experience!  
The Optimistic Lockable shows exactly that capability.

Let's see how it works ...

```typescript
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
```

```typescript
export function OptimisticLockableExamplePage({ rootStore }: { rootStore: Store }) {
    const store = useChildStore(rootStore, rootStore.links[0], OptimisticLockableStore, 1000, "optimistic-lockable")

    const id = useMemo(() => rootStore.links[0].connection.userData.id, [rootStore])

    const inputRef = useRef<HTMLInputElement>(null)

    const useStoreState = useMemo(() => create(store.state), [store])

    const { owner, value } = useStoreState()

    return (
        <div>
            <button className="btn btn-outline-primary" onClick={() => store.setSliderLock("none").subscribe()}>
                release
            </button>
            <h2>Owner: {owner}</h2>
            <input
                onChange={() => {
                    if (inputRef.current) {
                        if (owner !== id) {
                            store.setSliderLock(id).subscribe()
                        }
                        store.setSlider(id, inputRef.current.valueAsNumber)
                    }
                }}
                className="w-100"
                type="range"
                min={0}
                max={10}
                value={value}
                ref={inputRef}></input>
        </div>
    )
}
```
