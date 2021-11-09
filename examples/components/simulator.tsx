import { Suspense, useEffect, useMemo, useState } from "react"
import { Connection, createRootStore, RootStore, RootStoreDefaultLinkId } from "co-share"
import { ServerStub } from "../server-stub"

const names = ["Alice", "Bob"]

export function Simulator({
    children,
    initStores,
    log,
    twoClients,
}: {
    log?: boolean
    initStores: (rootStore: RootStore) => void
    twoClients?: boolean
    children: (rootStore: RootStore) => JSX.Element
}): JSX.Element | null {
    const [connections, setConnections] = useState<Array<Connection> | undefined>(undefined)

    useEffect(() => {
        const rootStore = createRootStore()
        initStores(rootStore)
        const serverStub = new ServerStub(rootStore, log ?? false)
        Promise.all(new Array(twoClients ? 2 : 1).fill(null).map((_, i) => serverStub.createConnection(names[i]))).then(
            setConnections
        )
    }, [log, setConnections, initStores, twoClients])

    if (connections == null) {
        return null
    }

    return (
        <>
            {connections.map((connection) => (
                <div
                    className="d-flex flex-column flex-grow-1 flex-basis-0 m-3 flex-shrink-1"
                    key={connection.userData.id}>
                    <h6>{connection.userData.id}</h6>
                    <div key={connection.userData.id} className="flex-grow-1 flex-basis-0 border border-2 rounded-3">
                        <View connection={connection} children={children} />
                    </div>
                </div>
            ))}
        </>
    )
}

export function View({
    children,
    connection,
}: {
    connection: Connection
    children: (rootStore: RootStore) => JSX.Element
}): JSX.Element {
    const rootStore = useMemo(() => {
        const rootStore = createRootStore()
        rootStore.link(RootStoreDefaultLinkId, connection)
        return rootStore
    }, [connection])

    return <Suspense fallback={"loading ..."}>{children(rootStore)}</Suspense>
}
