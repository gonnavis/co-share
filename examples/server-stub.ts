import { Connection, ConnectionMessage, RootStore, RootStoreDefaultLinkId, Store, StoreMap } from "co-share"
import { Subject } from "rxjs"

export class ServerStub {
    constructor(private readonly rootStore: RootStore, private readonly log: boolean) {}

    createConnection(id: string): Promise<Connection> {
        const clientToServerSubject = new Subject<ConnectionMessage>()
        const serverToClientSubject = new Subject<ConnectionMessage>()
        if (this.log) {
            clientToServerSubject.subscribe((msg) => console.log(`client ${id} to server:`, ...msg))
            serverToClientSubject.subscribe((msg) => console.log(`server to client ${id}:`, ...msg))
        }
        const disconnect = () =>
            setTimeout(() => {
                if (this.log) {
                    console.log(`client ${id} is now disconnected from the server`)
                }
                clientToServerSubject.complete()
                serverToClientSubject.complete()
            })
        const clientConnection: Connection = {
            userData: {
                id,
            },
            disconnect,
            publish: (id, actionIdentifier, ...params) =>
                setTimeout(() => clientToServerSubject.next([id, actionIdentifier, ...params]), 0),
            receive: () => serverToClientSubject,
        }
        const serverConnection: Connection = {
            userData: {
                id,
            },
            disconnect,
            publish: (id, actionIdentifier, ...params) =>
                setTimeout(() => serverToClientSubject.next([id, actionIdentifier, ...params]), 0),
            receive: () => clientToServerSubject,
        }
        if (this.log) {
            console.log(`client ${id} connected to server`)
        }
        this.rootStore.link(RootStoreDefaultLinkId, serverConnection)
        return new Promise((resolve) => setTimeout(() => resolve(clientConnection)))
    }
}
