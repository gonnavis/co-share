# Counter Example

A simple counter, right?  
Not quite!  
Behind this simple application is a whole system with a server and two (simulated) clients, that share the value of the counter!  

Let's see how it works ...

```typescript
export class CounterStore extends Store {
    public subscriber: Subscriber = Subscriber.create(CounterStore, (connection, accept, deny) =>
        accept(this.state.getState().counter)
    )

    public state: StoreApi<{ counter: number }>

    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    constructor(value: number) {
        super()
        this.state = create(() => ({ counter: value }))
    }

    increase = Action.create(this, "incr", (origin) => {
        this.increase.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin })
        this.state.setState({
            counter: this.state.getState().counter + 1,
        })
    })
}
```

```typescript
function CounterExamplePage({ rootStore }: { rootStore: RootStore }) {
    const store = useChildStore(rootStore, rootStore.links[0], CounterStore, 1000, "counter")
    const useStoreState = useMemo(() => create(store.state), [store])

    const { counter } = useStoreState()

    return (
        <div className="d-flex flex-row align-items-center">
            <h1 className="mx-3">{counter}</h1>
            <button className="m-1 btn btn-outline-primary" onClick={() => store.increase()}>
                +
            </button>
        </div>
    )
}
```
