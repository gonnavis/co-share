**For demonstration purposes, there is a 50% chance of failing when requesting a lock.**
**However, as soon as it fails, a new request will be sent.**

# Optimistic Lockable Example Source Code

[`optimistic-lockable.ts`](https://github.com/cocoss-org/co-share/blob/master/examples/stores/optimistic-lockable.ts)

```typescript
export class OptimisticLockableStore extends Store {
    public state: StoreApi<{ value: number; owner: string }>
    private history: History<{ value: number; owner: string }>

    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber<OptimisticLockableStore, [number, string]> = Subscriber.create(
        OptimisticLockableStore,
        (connection, accept, deny) => {
            const s = this.state.getState()
            accept(s.value, s.owner)
        }
    )

    constructor(value: number, owner: string) {
        super()
        this.state = create(() => ({ value, owner }))
        this.history = new History(this.state.getState(), (presence) => this.state.setState(presence))
    }

    setSliderLock: Request<this, [string], boolean> = Request.create(this, "setSliderLock", (origin, owner: string) => {
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
            return this.setSliderLock.publishTo(this.mainLink, owner).pipe(tap((keep) => resolve(keep)))
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

[`optimistic-lockable.tsx`](https://github.com/cocoss-org/co-share/blob/master/examples/pages/optimistic-lockable.tsx)

```typescript
export function OptimisticLockableExamplePage({ rootStore }: { rootStore: RootStore }): JSX.Element {
    const store = useStoreSubscription(
        "optimistic-lockable",
        1000,
        (value: number, owner: string) => new OptimisticLockableStore(value, owner),
        undefined,
        rootStore
    )

    const id = useMemo(() => rootStore.mainLink.connection.userData.id, [rootStore])

    const inputRef = useRef<HTMLInputElement>(null)

    const useStoreState = useMemo(
        () =>
            create<{
                value: number
                owner: string
            }>(store.state),
        [store]
    )

    const { owner, value } = useStoreState()

    return (
        <div className="p-3">
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
