import { Observable, Subject, Subscription } from "rxjs"
import { finalize, shareReplay, takeUntil } from "rxjs/operators"
import type { PathEntry, Store, StoreLink } from "."

export type StoreLinkCacheEntry = {
    get(): StoreLink | undefined
    subscribe(): Observable<StoreLink>
}

export type StoreLinkStoreCacheEntry = {
    store: Store
    entries: Array<StoreLinkCacheEntry>
}

export class StoreLinkCache {

    private readonly pathMap = new Map<string, StoreLinkStoreCacheEntry>()
    private readonly closeSubject = new Subject()

    findByPath(path: Array<PathEntry>): Array<StoreLinkCacheEntry> {
        return this.pathMap.get(path.join("."))?.entries ?? []
    }

    addLink(path: Array<PathEntry>, observable: Observable<StoreLink>): Observable<StoreLink> {
        const joinedPath = path.join(".")
        let val: StoreLink | undefined
        const share = observable.pipe(
            takeUntil(this.closeSubject),
            shareReplay(1)
        )
        const entry = {
            get: () => val,
            subscribe: () => share
        }
        this.pathMap.set(joinedPath, [...(this.pathMap.get(joinedPath) ?? []), entry])
        share.pipe(
            finalize(() => this.pathMap.set(joinedPath, (this.pathMap.get(joinedPath) ?? []).filter(e => e != entry)))
        ).subscribe(v => val = v)
        return share
    }

    close(): void {
        this.closeSubject.next()
        this.pathMap.forEach(entries => entries.forEach(entry => entry.get()?.close()))
    }

}