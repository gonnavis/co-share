import { useEffect, useMemo } from "react"
import { retryWhen, tap, delay } from "rxjs/operators"
import { Store, StoreLink, PathEntry, StoreFactory } from ".."

const storeDataSet = new Set<{
    referenceCount: number
    parentStore: Store
    path: PathEntry
    storeLink: StoreLink
}>()

export function useChildStore<S extends Store>(
    parentStore: Store,
    parentStoreLink: StoreLink,
    storeFactory: StoreFactory<S>,
    retryAfter: number,
    path: PathEntry
): S {
    const storeData = useMemo(
        () => Array.from(storeDataSet).find((s) => s.parentStore === parentStore && s.path === path),
        []
    )

    if (storeData == null) {
        throw parentStore
            .subscribeToChild(storeFactory, parentStoreLink, path)
            .pipe(
                tap((hostLink) => storeDataSet.add({ referenceCount: 0, parentStore, path, storeLink: hostLink })),
                retryWhen((error) => error.pipe(delay(retryAfter)))
            )
            .toPromise()
    }

    useEffect(() => {
        storeData.referenceCount += 1
        return () => {
            storeData.referenceCount -= 1
            if (storeData.referenceCount === 0) {
                storeData.storeLink.store.unsubscribe.publishTo({ to: "one", one: storeData.storeLink })
                storeData.storeLink.close()
                storeDataSet.delete(storeData)
            }
        }
    }, [storeData])
    return storeData.storeLink.store as S
}
