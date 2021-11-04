export function isBrowser(): boolean {
    return ![typeof window, typeof document].includes("undefined")
}

export function filterNull<S>(val: S | undefined): val is S {
    return val != null
}

export * from "./connection"
export * from "./store-link"
export * from "./store-link-cache"
export * from "./store"
export * from "./action"
export * from "./subscriber"
export * from "./request"
