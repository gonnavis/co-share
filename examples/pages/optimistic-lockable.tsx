import { Store } from "co-share"
import { useChildStore } from "co-share/react"
import React, { useMemo, useRef } from "react"
import create from "zustand"
import { Header } from "../components/header"
import { Simulator } from "../components/simulator"
import { OptimisticLockableStore } from "../stores/optimistic-lockable"
import MD from "../content/optimistic-lockable.md"
import { Footer } from "../components/footer"

export default function Index() {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={5} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator
                        twoClients
                        initStore={(rootStore) =>
                            rootStore.addChildStore(
                                new OptimisticLockableStore(0, "none"),
                                false,
                                "optimistic-lockable"
                            )
                        }>
                        {(rootStore) => <OptimisticLockableExamplePage rootStore={rootStore} />}
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

export function OptimisticLockableExamplePage({ rootStore }: { rootStore: Store }) {
    const store = useChildStore(rootStore, rootStore.links[0], OptimisticLockableStore, 1000, "optimistic-lockable")

    const id = useMemo(() => rootStore.links[0].connection.userData.id, [rootStore])

    const inputRef = useRef<HTMLInputElement>(null)

    const useStoreState = useMemo(() => create(store.state), [store])

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
