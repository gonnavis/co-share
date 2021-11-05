import React, { useMemo } from "react"
import { CounterStore } from "../stores/counter"
import create from "zustand"
import { useStoreSubscription } from "co-share/react"
import { Simulator } from "../components/simulator"
import { Header } from "../components/header"
import MD from "../content/counter.md"
import { Footer } from "../components/footer"
import { RootStore } from "co-share"

export default function Index() {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={0} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator
                        twoClients
                        initStores={(rootStore) => rootStore.addStore(new CounterStore(0), "counter")}>
                        {(rootStore) => <CounterExamplePage rootStore={rootStore} />}
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

function CounterExamplePage({ rootStore }: { rootStore: RootStore }) {
    const store = useStoreSubscription(
        "counter",
        1000,
        (value: number) => new CounterStore(value),
        undefined,
        rootStore
    )
    const useStoreState = useMemo(
        () =>
            create<{
                counter: number
            }>(store.state),
        [store]
    )

    const { counter } = useStoreState()

    return (
        <div className="p-3 d-flex flex-row align-items-center">
            <h1 className="mx-3">{counter}</h1>
            <button className="m-1 btn btn-outline-primary" onClick={() => store.increase()}>
                +
            </button>
        </div>
    )
}
