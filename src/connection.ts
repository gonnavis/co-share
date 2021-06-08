import { Observable } from "rxjs"
import { StoreLinkId, StoreLinkMessage } from "."

export type ConnectionMessage = [id: StoreLinkId, ...storeLinkMessage: StoreLinkMessage]

export type Connection = {
    userData: any

    publish(...message: ConnectionMessage): void
    receive(): Observable<ConnectionMessage>

    disconnect(): void
}
