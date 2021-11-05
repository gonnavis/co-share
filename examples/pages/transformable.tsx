import React, { MutableRefObject, useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Matrix4, Mesh, Object3D, Vector3 } from "three"
import { TransformableStore } from "../stores/transformable"
import { RootStore } from "co-share"
import { useStoreSubscription } from "co-share/react"
import { StoreApi } from "zustand"
import { Simulator } from "../components/simulator"
import { Header } from "../components/header"
import MD from "../content/transformable.md"
import { Footer } from "../components/footer"

export default function Index() {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={7} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator
                        twoClients
                        initStores={(rootStore) =>
                            rootStore.addStore(
                                new TransformableStore([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], "none"),
                                "transformable"
                            )
                        }>
                        {(rootStore) => <TransformableExamplePage rootStore={rootStore} />}
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

const helperMatrix = new Matrix4()
export function useSyncTransformable(
    state: StoreApi<{ matrix: Array<number>; owner: string }>,
    objectRef: MutableRefObject<Object3D | null>
): { ownerRef: MutableRefObject<string> } {
    const helperMatrix = useMemo(() => new Matrix4(), [])
    const ownerRef = useRef<string>(state.getState().owner)

    useEffect(() => {
        const updateTransform = ({ matrix, owner }: { matrix: Array<number>; owner: string }) => {
            ownerRef.current = owner
            if (objectRef.current != null) {
                helperMatrix.fromArray(matrix)
                objectRef.current.position.setFromMatrixPosition(helperMatrix)
                objectRef.current.scale.setFromMatrixScale(helperMatrix)
                objectRef.current.quaternion.setFromRotationMatrix(helperMatrix)
            }
        }
        updateTransform(state.getState())
        return state.subscribe(updateTransform)
    }, [state])
    return { ownerRef }
}

export function TransformableExamplePage({ rootStore }: { rootStore: RootStore }) {
    const store = useStoreSubscription(
        "transformable",
        1000,
        (matrix: Array<number>, owner: string) => new TransformableStore(matrix, owner),
        undefined,
        rootStore
    )

    const id = useMemo(() => rootStore.mainLink.connection.userData.id, [rootStore])

    return (
        <Canvas>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Block store={store} id={id} />
        </Canvas>
    )
}

export function Block({ store, id }: { store: TransformableStore; id: string }) {
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
