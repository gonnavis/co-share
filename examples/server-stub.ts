import { Connection, ConnectionMessage, RootStoreDefaultLinkId, Store } from "co-share"
import { Subject } from "rxjs"
import { v4 as uuid } from "uuid"

export class ServerStub {
    constructor(private readonly rootStore: Store, private readonly log: boolean) {}

    createConnection(): Promise<Connection> {
        const id = uuid()
        const clientToServerSubject = new Subject<ConnectionMessage>()
        const serverToClientSubject = new Subject<ConnectionMessage>()
        if (this.log) {
            clientToServerSubject.subscribe((msg) => console.log(`client ${id} to server:`, ...msg))
            serverToClientSubject.subscribe((msg) => console.log(`server to client ${id}:`, ...msg))
        }
        const disconnect = () => {
            if (this.log) {
                console.log(`client ${id} is now disconnected from the server`)
            }
            clientToServerSubject.complete()
            serverToClientSubject.complete()
        }
        const clientConnection: Connection = {
            userData: {
                id,
            },
            disconnect,
            publish: (id, actionIdentifier, ...params) => clientToServerSubject.next([id, actionIdentifier, ...params]),
            receive: () => serverToClientSubject,
        }
        const serverConnection: Connection = {
            userData: {
                id,
            },
            disconnect,
            publish: (id, actionIdentifier, ...params) => serverToClientSubject.next([id, actionIdentifier, ...params]),
            receive: () => clientToServerSubject,
        }
        return new Promise((resolve, reject) =>
            this.rootStore.subscriber(
                serverConnection,
                () => {
                    if (this.log) {
                        console.log(`client ${id} connected to server`)
                    }
                    this.rootStore.link(RootStoreDefaultLinkId, serverConnection)
                    resolve(clientConnection)
                },
                reject
            )
        )
    }
}
