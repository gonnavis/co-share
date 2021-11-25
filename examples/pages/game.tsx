import React, { useCallback, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { TransformableStore } from "../stores/transformable"
import { RootStore } from "co-share"
import { useStoreSubscription } from "co-share/react"
import { Simulator } from "../components/simulator"
import { Header } from "../components/header"
import MD from "../content/transformable.md"
import { Footer } from "../components/footer"
import { PerspectiveCamera } from "@react-three/drei"
import { GameStore, State } from "../stores/game"
import { useFPSControls, useLockedRef } from "../components/useFPSControls"

export default function Index(): JSX.Element {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={7} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator
                        twoClients
                        initStores={(rootStore) => rootStore.addStore(new GameStore(0, undefined, {}), "game")}>
                        {(rootStore) => <GameExamplePage rootStore={rootStore} />}
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

export function GameExamplePage({ rootStore }: { rootStore: RootStore }): JSX.Element {
    const store = useStoreSubscription(
        "game",
        1000,
        (time: number, playerId: string | undefined, state: State) => new GameStore(time, playerId, state),
        undefined,
        rootStore
    )

    const id = useMemo(() => rootStore.mainLink.connection.userData.id, [rootStore])

    const lockedRef = useLockedRef(
        undefined,
        useMemo(() => store.unlock.bind(store), [store])
    )

    useFPSControls(
        lockedRef,
        store.jump.bind(store),
        store.move.bind(store, true),
        store.move.bind(store, false),
        store.rotate.bind(store),
        5
    )

    return (
        <Canvas>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            {Object.entries({} as State).map(([i, s]) => i === id ? <Player/> : <ForeignPlayer/>)}
        </Canvas>
    )
}

export function ForeignPlayer({ state }: { state: State[string] }): JSX.Element {
    return (
        <mesh scale-y={2} position={state.position} rotation={state.rotation}>
            <boxBufferGeometry />
        </mesh>
    )
}

export function Player({ state }: { state: State[string] }) {
    return <PerspectiveCamera position={state.position} rotation={state.rotation} makeDefault />
}
