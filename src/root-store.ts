import { Observable, throwError } from "rxjs"
import { map, tap } from "rxjs/operators"
import { PathEntry, Store, Request, StoreMap } from "."
import { StoreLink, StoreLinkId } from "./store-link"
import { Subscriber, SubscriberGetParams } from "./subscriber"

export const SubscribeRequest = Request.createUnbound<RootStore, [id: StoreLinkId, path: PathEntry], Array<any>>(
    "requestSubscribe",
    function (origin: StoreLink | undefined, id: StoreLinkId, path: PathEntry) {
        if (origin == null) {
            throw `subscribeToChild can only be executed remotely using "publish"`
        }
        const store = this.storeMap.get(path)
        if (store == null) {
            return throwError(`unable to find store with path "${path}"`)
        }

        if (store instanceof store.subscriber.storeClass) {
            return new Observable<Array<any>>((subscriber) =>
                store.subscriber(
                    origin.connection,
                    (...params) => subscriber.next(params),
                    (reason) => subscriber.error(reason)
                )
            ).pipe(tap(() => store.link(id, origin.connection)))
        } else {
            return throwError(
                "Subscribed store has no correct implemented subscriber. Subscriber must be created with the store class."
            )
        }
    }
)

export class RootStore extends Store {
    public subscriber: Subscriber<RootStore, []> = Subscriber.create<RootStore, []>(
        RootStore,
        (connection, accept, deny) => deny("can't subscribe to the root store")
    )

    constructor(public readonly storeMap: StoreMap) {
        super()
    }

    private requestSubscribe = SubscribeRequest.bindTo(this)

    public addStore(store: Store, path: PathEntry): void {
        if (this.storeMap.has(path)) {
            throw `a store with the path "${path} was already added, a store's path must be unique inside one root store"`
        }
        this.storeMap.set(path, store)
    }

    public destroyStore(store: Store, path: PathEntry): void {
        const s = this.storeMap.get(path)
        if (s == null) {
            console.warn(`no store on path "${path}" found`)
            return
        }
        if (s === store) {
            this.storeMap.delete(path)
            store.linkSet.forEach((link) => link.close())
            return
        }
        throw `the provided store with path "${path}" is occupied by another store and therefore can't be destroyed`
    }

    subscribe<S extends Store>(
        path: PathEntry,
        parentLink: StoreLink,
        storeFactory: StoreFactory<S>
    ): Observable<[S, StoreLink]> {
        const newLinkId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        return this.requestSubscribe.publishTo(parentLink, newLinkId, path).pipe(
            map((remoteParams) => {
                const store = storeFactory(...(remoteParams as SubscriberGetParams<S["subscriber"]>))
                this.addStore(store, path)
                const link = store.link(newLinkId, parentLink.connection)
                return [store, link]
            })
        )
    }

    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}
}

export type StoreFactory<S extends Store> = (...remoteParams: SubscriberGetParams<S["subscriber"]>) => S
