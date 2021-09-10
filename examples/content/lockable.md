# Lockable Example

In multiuser applications it is really important to manage the rights of a user to change something.  
What should happen if two clients alter the same slider?  
With this Lockable approach, you can solve this problem easily!

Let's see how it works ...

```typescript
export class LockableStore extends Store {
    public state: StoreApi<{ value: number; owner: string }>

    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber = Subscriber.create(LockableStore, (connection, accept, deny) => {
        const s = this.state.getState()
        accept(s.value, s.owner)
    })

    constructor(value: number, owner: string) {
        super()
        this.state = create(() => ({ value, owner }))
    }

    setSlider = Action.create(this, "setSlider", (origin, by: string, value: number) => {
        const { owner } = this.state.getState()
        if (owner != by) {
            return
        }

        this.state.setState({ value })

        this.setSlider.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, by, value)
    })

    setSliderLock: Request<[string], boolean> = Request.create(this, "setSliderLock", (origin, owner: string) => {
        return (origin == null ? this.setSliderLock.publishTo(this.links[0], owner) : of(true).pipe(delay(1000))).pipe(
            tap((approved) => {
                if (approved) {
                    this.forceSliderLock(owner)
                    if (origin != null) {
                        this.forceSliderLock.publishTo({ to: "all-except-one", except: origin }, owner)
                    }
                }
            })
        )
    })

    forceSliderLock = Action.create(this, "forceSliderLock", (origin, owner: string) => {
        this.state.setState({
            owner,
        })
    })
}
```

```typescript
export function LockableExamplePage({ rootStore }: { rootStore: Store }) {
    const store = useChildStore(rootStore, rootStore.links[0], LockableStore, 1000, "lockable")

    const id = useMemo(() => rootStore.links[0].connection.userData.id, [rootStore])
    const inputRef = useRef<HTMLInputElement>(null)

    const useStoreState = useMemo(() => create(store.state), [store])

    const { owner, value } = useStoreState()

    return (
        <div>
            <button className="btn btn-outline-primary" onClick={() => store.setSliderLock(id).subscribe()}>
                lock
            </button>
            <button className="btn btn-outline-danger mx-3" onClick={() => store.setSliderLock("none").subscribe()}>
                release
            </button>
            <h2>Owner: {owner}</h2>
            <input
                className="w-100"
                onChange={() => inputRef.current && store.setSlider(id, inputRef.current.valueAsNumber)}
                type="range"
                min={0}
                max={10}
                value={value}
                ref={inputRef}></input>
        </div>
    )
}
```
