import { Line, WhiteboardStore } from "../stores/whiteboard"
import { useStoreSubscription } from "co-share/react"
import { RootStore } from "co-share"
import React, { useCallback, useEffect, useMemo, useRef, useState, PointerEvent } from "react"
import { tap } from "rxjs/operators"
import { Simulator } from "../components/simulator"
import { Header } from "../components/header"
import MD from "../content/whiteboard.md"
import { Footer } from "../components/footer"

export default function Index() {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={6} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator
                        twoClients
                        initStores={(rootStore) => rootStore.addStore(new WhiteboardStore([]), "whiteboard")}>
                        {(rootStore) => <WhiteboardExamplePage rootStore={rootStore} />}
                    </Simulator>
                </div>
                <div className="p-3 flex-basis-0 flex-grow-1">
                    <MD />
                </div>
            </div>
            <Footer />
        </div>
    )
}

export function WhiteboardExamplePage({ rootStore }: { rootStore: RootStore }) {
    const store = useStoreSubscription(
        "whiteboard",
        1000,
        (lines: Array<Line>) => new WhiteboardStore(lines),
        undefined,
        rootStore
    )
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
