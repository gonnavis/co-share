import type { PathEntry, Store } from "./store"

export function isBrowser(): boolean {
    return ![typeof window, typeof document].includes("undefined")
}

export type StoreMap = Map<PathEntry, Store>

export * from "./connection"
export * from "./store-link"
export * from "./store"
export * from "./action"
export * from "./subscriber"
export * from "./request"
export * from "./root-store"

import { RootStore } from "./root-store"

export function createRootStore(): RootStore {
    return new RootStore(new Map())
}

export const rootStore = createRootStore()
