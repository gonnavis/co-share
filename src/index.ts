export function isBrowser() {
    return ![typeof window, typeof document].includes("undefined")
}

export * from "./connection"
export * from "./store-link"
export * from "./store"
export * from "./action"
export * from "./subscriber"
export * from "./request"
