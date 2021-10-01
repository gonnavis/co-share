import { useEffect, useMemo } from "react"
import { ConnectableObservable, Observable } from "rxjs"
import { retryWhen, tap, delay, finalize, publish } from "rxjs/operators"
import { Store, StoreLink, PathEntry } from ".."

type StoreDataSetLoadingEntry = {
    type: "loading"
    observable: Observable<[Store, StoreLink]>
    parentStore: Store
    path: PathEntry
}

type StoreDataSetLoadedEntry = {
    type: "loaded"
    referenceCount: number
    parentStore: Store
    path: PathEntry
    store: Store
    hostLink: StoreLink
}

type StoreDataSetEntry = StoreDataSetLoadingEntry | StoreDataSetLoadedEntry

const storeDataSet = new Set<StoreDataSetEntry>()

export function useChildStore<S extends Store>(
    parentStore: Store,
    storeLink: StoreLink,
    childConstr: new (...params: Array<any>) => S,
    retryAfter: number,
    path: PathEntry
): S {
    const storeData = useMemo(
        () => Array.from(storeDataSet).find((s) => s.parentStore === parentStore && s.path === path),
        []
    )

    if (storeData == null) {
        const loadingEntry: StoreDataSetLoadingEntry = {
            parentStore,
            path,
            type: "loading",
            observable: null as any,
        }
        const observable: ConnectableObservable<[Store, StoreLink]> = parentStore
            .subscribeToChild(childConstr, storeLink, path)
            .pipe(
                tap(([store, hostLink]) =>
                    storeDataSet.add({ type: "loaded", referenceCount: 0, parentStore, path, hostLink, store })
                ),
                retryWhen((error) => error.pipe(delay(retryAfter))),
                finalize(() => storeDataSet.delete(loadingEntry)),
                publish()
            ) as any
        loadingEntry.observable = observable
        storeDataSet.add(loadingEntry)
        observable.connect()
        throw observable.toPromise()
    } else if (storeData.type === "loading") {
        throw storeData.observable.toPromise()
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
