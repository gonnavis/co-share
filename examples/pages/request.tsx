import { RootStore } from "co-share"
import { useStoreSubscription } from "co-share/react"
import React, { useEffect, useRef, useState } from "react"
import { useCallback } from "react"
import { Observable } from "rxjs"
import { retry, tap, timeout } from "rxjs/operators"
import { Header } from "../components/header"
import { Simulator } from "../components/simulator"
import { RequestStore } from "../stores/request"
import MD from "../content/request.md"
import { Footer } from "../components/footer"

export default function Index(): JSX.Element {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={1} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator initStores={(rootStore) => rootStore.addStore(new RequestStore(), "request")}>
                        {(rootStore) => <RequestExamplePage rootStore={rootStore} />}
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

export function RequestExamplePage({ rootStore }: { rootStore: RootStore }): JSX.Element {
    const store = useStoreSubscription("request", 1000, () => new RequestStore(), undefined, rootStore)

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
            <div className="p-3 input-group">
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
}): JSX.Element {
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
