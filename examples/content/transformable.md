# Transformable Example Source Code

[`transformable.ts`](https://github.com/cocoss-org/co-share/blob/master/examples/stores/transformable.ts)

```typescript
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
```

[`transformable.tsx`](https://github.com/cocoss-org/co-share/blob/master/examples/pages/transformable.tsx)

```typescript
export function TransformableExamplePage({ rootStore }: { rootStore: RootStore }): JSX.Element {
    const store = useStoreSubscription(
        "transformable",
        1000,
        (matrix: Array<number>, owner: string) => new TransformableStore(matrix, owner),
        undefined,
        rootStore
    )

    const id = useMemo(() => rootStore.mainLink.connection.userData.id, [rootStore])

    return (
        <Canvas style={{ touchAction: "none" }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Block store={store} id={id} />
        </Canvas>
    )
}

export function Block({ store, id }: { store: TransformableStore; id: string }): JSX.Element {
    const grabbedRef = useRef(false)
    const helperArray = useMemo<Array<number>>(() => [], [])

    const mesh = useRef<Mesh>(null)
    const camera = useThree(({ camera }) => camera)

    const { ownerRef } = useSyncTransformable(store.state, mesh)

    useFrame(({ mouse }) => {
        if (grabbedRef.current) {
            const position = new Vector3(mouse.x, mouse.y, 0)
            position.applyMatrix4(camera.projectionMatrixInverse)
            position.multiplyScalar(camera.position.z / position.z)
            helperMatrix.identity()
            helperMatrix.setPosition(-position.x, -position.y, 0)
            helperMatrix.toArray(helperArray)
            store.transform(id, helperArray)
        }
    })

    //TODO: fix mobile dragging (e.g. w. useGesture)
    useEffect(() => {
        const onPointerUp = () => {
            if (id == ownerRef.current) {
                grabbedRef.current = false
                store.setLock("none").subscribe((approved) => {
                    if (!approved) {
                        grabbedRef.current = true
                    }
                })
            }
        }
        window.addEventListener("mouseup", onPointerUp)
        return () => window.removeEventListener("mouseup", onPointerUp)
    }, [id, store])

    return (
        <mesh
            ref={mesh}
            onPointerDown={() => {
                store.setLock(id).subscribe((approved) => {
                    if (!approved) {
                        grabbedRef.current = false
                    }
                })
                grabbedRef.current = true
            }}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
        </mesh>
    )
}
```
