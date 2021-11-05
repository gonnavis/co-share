import { RootStore } from "co-share"
import { useStoreSubscription } from "co-share/react"
import React, { useMemo, useRef } from "react"
import create from "zustand"
import { Header } from "../components/header"
import { Simulator } from "../components/simulator"
import { LockableStore } from "../stores/lockable"
import MD from "../content/lockable.md"
import { Footer } from "../components/footer"

export default function Index(): JSX.Element {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={4} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator
                        twoClients
                        initStores={(rootStore) => rootStore.addStore(new LockableStore(0, "none"), "lockable")}>
                        {(rootStore) => <LockableExamplePage rootStore={rootStore} />}
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

export function LockableExamplePage({ rootStore }: { rootStore: RootStore }): JSX.Element {
    const store = useStoreSubscription(
        "lockable",
        1000,
        (value: number, owner: string) => new LockableStore(value, owner),
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
