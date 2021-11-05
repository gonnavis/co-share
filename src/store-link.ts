import { ActionIdentifier } from "./action"
import { Connection } from "./connection"

export type StoreLinkId = string | number
export type StoreLinkMessage = [actionIdentifier: ActionIdentifier, ...params: Array<any>]

export const RootStoreDefaultLinkId = Number.MIN_SAFE_INTEGER

export interface StoreLink {
    id: StoreLinkId
    connection: Connection
    publish(...message: StoreLinkMessage): void
    close(): void
}
