import { useEffect, useMemo } from "react"
import { retryWhen, tap, delay } from "rxjs/operators"
import { Store, StoreLink, PathEntry } from ".."

const storeDataSet = new Set<{
    referenceCount: number
    parentStore: Store
    path: [PathEntry, ...Array<PathEntry>]
    store: Store
    hostLink: StoreLink
}>()

export function useChildStore<S extends Store>(
    parentStore: Store,
    storeLink: StoreLink,
    childConstr: new (...params: Array<any>) => S,
    retryAfter: number,
    ...path: [PathEntry, ...Array<PathEntry>]
): S {
    const storeData = useMemo(
        () =>
            Array.from(storeDataSet).find((s) => s.parentStore === parentStore && s.path.join("/") === path.join("/")),
        []
    )

    if (storeData == null) {
        throw parentStore
            .subscribeToChild(childConstr, storeLink, ...path)
            .pipe(
                tap(([store, hostLink]) => storeDataSet.add({ referenceCount: 0, parentStore, path, hostLink, store })),
                retryWhen((error) => error.pipe(delay(retryAfter)))
            )
            .toPromise()
    }

    useEffect(() => {
        storeData.referenceCount += 1
        return () => {
            storeData.referenceCount -= 1
            if (storeData.referenceCount === 0) {
                storeData.store.unsubscribe.publishTo({ to: "one", one: storeData.hostLink })
                storeData.hostLink.close()
                storeDataSet.delete(storeData)
            }
        }
    }, [storeData])
    return storeData.store as S
}
