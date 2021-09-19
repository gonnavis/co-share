import { Suspense, useEffect, useMemo, useState } from "react"
import { Connection, RootStoreDefaultLinkId } from "co-share"
import { ServerStub } from "../server-stub"
import { RootStore } from "../stores/root-store"

export function Simulator({
    children,
    initStore,
    log,
    twoClients,
}: {
    log?: boolean
    initStore: (rootStore: RootStore) => void
    children: (rootStore: RootStore) => JSX.Element
    twoClients?: boolean
}) {
    const [connections, setConnections] = useState<Array<Connection> | undefined>(undefined)

    useEffect(() => {
        const rootStore = new RootStore()
        initStore(rootStore)
        const serverStub = new ServerStub(rootStore, log ?? false)
        Promise.all(new Array(twoClients ? 2 : 1).fill(null).map(() => serverStub.createConnection())).then(
            setConnections
        )
    }, [log, setConnections, initStore, twoClients])

    if (connections == null) {
        return null
    }

    return (
        <>
            {connections.map((connection, index) => (
                <div
                    className="d-flex flex-column flex-grow-1 flex-basis-0 m-3 flex-shrink-1"
                    key={connection.userData.id}>
                    <h6>Client {connection.userData.id}</h6>
                    <div
                        key={connection.userData.id}
                        className="flex-grow-1 flex-basis-0 border border-2 rounded-3">
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
}) {
    const rootStore = useMemo(() => {
        if (connection == null) {
            return undefined
        }
        const store = new RootStore()
        store.link(RootStoreDefaultLinkId, connection)
        return store
    }, [connection])

    if (rootStore == null) {
        return <span>Connecting to root store ...</span>
    }

    return <Suspense fallback={"loading ..."}>{children(rootStore)}</Suspense>
}
