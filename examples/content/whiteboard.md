# Whiteboard Example

Let's see how it works ...

```typescript
export type Line = {
    color: string
    x0: number
    y0: number
    x1: number
    y1: number
}

export class WhiteboardStore extends Store {
    public lines: Array<Line>
    public linesSubject = new Subject<Line>()

    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber = Subscriber.create(WhiteboardStore, (connection, accept, deny) => accept(this.lines))

    constructor(lines: Array<Line>) {
        super()
        this.lines = lines
    }

    public addLine = Action.create(this, "addLine", (origin, line: Line) => {
        this.lines.push(line)
        this.linesSubject.next(line)
        this.addLine.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, line)
    })
}
```

```typescript
export function WhiteboardExamplePage({ rootStore }: { rootStore: Store }) {
    const store = useChildStore(rootStore, rootStore.links[0], WhiteboardStore, 1000, "whiteboard")
    return <Whiteboard store={store} />
}

function getXYFromPointerEvent(e: PointerEvent): { x: number; y: number } {
    if (e.target instanceof HTMLElement) {
        const rect = e.target.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }
    return { x: 0, y: 0 }
}

export function Whiteboard({ store }: { store: WhiteboardStore }) {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

    const context = useMemo(() => canvas?.getContext("2d"), [canvas])

    const drawLine = useCallback(
        ({ color, x0, x1, y0, y1 }: Line) => {
            if (context == null) {
                return
            }
            context.strokeStyle = color
            context.beginPath()
            context.moveTo(x0, y0)
            context.lineTo(x1, y1)
            context.stroke()
        },
        [context]
    )

    useEffect(() => {
        if (canvas == null) {
            return
        }
        const resize = () => {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
            store.lines.forEach(drawLine)
        }
        resize()
        window.addEventListener("resize", resize)
        return () => window.removeEventListener("resize", resize)
    }, [canvas])

    useEffect(() => {
        const subscription = store.linesSubject.pipe(tap(drawLine)).subscribe()
        return () => {
            context?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0)
            subscription.unsubscribe()
        }
    }, [context, canvas, store, drawLine])

    const lastPointerPosition = useRef<{ x: number; y: number }>()

    //TODO: fix mobile dragging (e.g. w. useGesture)
    const onPointerMove = useCallback(
        (event: PointerEvent) => {
            if (lastPointerPosition.current != null) {
                const { x, y } = getXYFromPointerEvent(event)
                store.addLine({
                    color: "#000",
                    x0: lastPointerPosition.current.x,
                    y0: lastPointerPosition.current.y,
                    x1: x,
                    y1: y,
                })
                console.log(event.clientX)
                lastPointerPosition.current.x = x
                lastPointerPosition.current.y = y
            }
        },
        [store, canvas]
    )
    const onPointerDown = useCallback(
        (event: PointerEvent) => (lastPointerPosition.current = getXYFromPointerEvent(event)),
        []
    )
    const onPointerUp = useCallback((event: PointerEvent) => (lastPointerPosition.current = undefined), [])

    return (
        <canvas
            style={{ width: "100%", height: "100%" }}
            ref={setCanvas}
            onPointerOut={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        />
    )
}
```
