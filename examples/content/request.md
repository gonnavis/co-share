# Request Example

Let's see how it works ...

```typescript
export class RequestStore extends Store {
    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber = Subscriber.create(RequestStore, (connection, accept, deny) => accept())

    add: Request<[number, number], number> = Request.create(this, "add", (origin, v1: number, v2: number) => {
        if (origin == null) {
            return this.add.publishTo(this.links[0], v1, v2)
        }
        return Math.random() > 0.5 ? NEVER : of(v1 + v2)
    })
}
```

```typescript
export function RequestExamplePage({ rootStore }: { rootStore: Store }) {
    const store = useChildStore(rootStore, rootStore.links[0], RequestStore, 1000, "request")

    const [requests, setRequests] = useState<Array<{ v1: number; v2: number }>>([])

    const v1Ref = useRef<HTMLInputElement>(null)
    const v2Ref = useRef<HTMLInputElement>(null)

    const add = useCallback(() => {
        if (v1Ref.current && v2Ref.current) {
            const v1 = v1Ref.current.valueAsNumber
            const v2 = v2Ref.current.valueAsNumber
            setRequests([...requests, { v1, v2 }])
        }
    }, [requests])

    return (
        <>
            <div className="input-group mb-3">
                <input
                    type="number"
                    ref={v1Ref}
                    style={{ flexGrow: 1 }}
                    className="form-control"
                    placeholder="Variable 1"
                />
                <input
                    type="number"
                    ref={v2Ref}
                    style={{ flexGrow: 1 }}
                    className="form-control"
                    placeholder="Variable 2"
                />
                <div className="input-group-append">
                    <button className="btn btn-outline-primary" onClick={add} type="button">
                        Add
                    </button>
                </div>
            </div>
            {requests.map(({ v1, v2 }, index) => (
                <Request addRequest={store.add.bind(store)} v1={v1} v2={v2} key={index} />
            ))}
        </>
    )
}

export function Request({
    v1,
    v2,
    addRequest,
}: {
    v1: number
    v2: number
    addRequest: (v1: number, v2: number) => Observable<number>
}) {
    const [result, setResult] = useState<string>("loading ...")
    useEffect(() => {
        const subscription = addRequest(v1, v2)
            .pipe(
                timeout(1000),
                retry(),
                tap((val) => setResult(val.toString()), console.error)
            )
            .subscribe()
        return () => subscription.unsubscribe()
    }, [])
    return (
        <div>
            {v1} + {v2} = {result}
        </div>
    )
}
```
