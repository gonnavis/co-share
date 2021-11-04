import { merge, Observable, of, Subject, throwError } from "rxjs"
import { filter, tap, takeUntil, finalize, map, take, switchMap } from "rxjs/operators"
import { Connection, StoreLink, StoreLinkCache, StoreLinkId } from "."
import { ActionIdentifier, Action } from "./action"
import { Request } from "./request"
import { Subscriber } from "./subscriber"

export type PathEntry = string | number

export const LogAction = Action.createUnbound("log", function (origin, log: any) {
    console.log(this, origin, log)
})

export const UnsubscribeAction = Action.createUnbound("unsubscribe", (origin) => {
    if (origin == null) {
        throw "can't execute unsubscribe locally"
    }
    origin.close()
})

export const SubscribeToChildRequest = Request.createUnbound(
    "requestSubscribeToChild",
    function (origin: StoreLink | undefined, id: StoreLinkId, path: PathEntry) {
        if (origin == null) {
            throw `subscribeToChild can only be executed remotely using "publish"`
        }
        const entries = this.storeLinkCache.findByPath([...this.path, path])
        if (entries.length === 0) {
            return throwError(`unable to find child in store ${this.path} at path entry "${path}"`)
        }
        if (entries.length > 1) {
            return throwError(`multiple options for child in store ${this.path} at path entry "${path}"`)
        }
        return entries[0].subscribe().pipe(
            switchMap((storeLink) => {
                const childStore = storeLink.store
                if (childStore instanceof childStore.subscriber.storeClass) {
                    return new Observable<Array<any>>((subscriber) =>
                        childStore.subscriber(
                            origin.connection,
                            (...params) => subscriber.next(params),
                            (reason) => subscriber.error(reason)
                        )
                    ).pipe(tap(() => childStore.link(id, origin.connection)))
                } else {
                    return throwError(
                        "Subscribed store has no correct implemented subscriber. Subscriber must be created with the store class."
                    )
                }
            })
        )
    }
)

export abstract class Store {
    public readonly actionMap = new Map<ActionIdentifier, Action<this, Array<any>>>()

    public abstract subscriber: Subscriber<Store, Array<any>>

    public abstract onUnlink(link: StoreLink): void

    public abstract onLink(link: StoreLink): void

    log = LogAction.bindTo(this)
    unsubscribe = UnsubscribeAction.bindTo(this)
    private requestSubscribeToChild = SubscribeToChildRequest.bindTo(this)

    constructor(public readonly path: Array<PathEntry>, public readonly storeLinkCache: StoreLinkCache) {}

    subscribeToChild<S extends Store>(
        storeFactory: StoreFactory<S>,
        link: StoreLink,
        path: PathEntry
    ): Observable<StoreLink> {
        const newPath = [...this.path, path]
        const entries = this.storeLinkCache.findByPath(newPath)
        const entry = entries.find((entry) => entry.get()?.connection === link.connection)
        if (entry == null) {
            const newLinkId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
            return this.storeLinkCache.addLink(
                newPath,
                this.requestSubscribeToChild.publishTo(link, newLinkId, path).pipe(
                    switchMap((params) => {
                        const store = storeFactory(newPath, params)
                        const observable = store.link(newLinkId, link.connection)
                        return observable
                    })
                )
            )
        } else {
            return entry.subscribe()
        }
    }

    link(id: StoreLinkId, connection: Connection): Observable<StoreLink> {
        const onDisconnect = new Subject<void>()
        const storeLink: StoreLink = {
            id,
            store: this,
            connection,
            close: () => onDisconnect.next(),
            publish: (actionName, ...params) => connection.publish(id, actionName, ...params),
        }
        this.onLink(storeLink)
        return merge(
            connection.receive().pipe(
                filter(([_id]) => id === _id),
                tap(([, actionName, ...params]) => {
                    const action = this.actionMap.get(actionName)
                    if (action != null) {
                        try {
                            action.forwardFrom(storeLink, ...params)
                        } catch (error) {
                            this.log.publishTo(
                                { to: "one", one: storeLink },
                                `error occured when executing ${actionName}: ${error}`
                            )
                        }
                    } else {
                        this.log.publishTo({ to: "one", one: storeLink }, `unkown action ${actionName}`)
                    }
                }),
                filter<any>(() => false)
            ),
            of(storeLink)
        ).pipe(
            takeUntil(onDisconnect),
            finalize(() => this.onUnlink(storeLink))
        )
    }

    close(): void {
        this.storeLinkCache.findByPath(this.path).forEach((entry) => entry.get()?.close())
    }
}

export type StoreFactory<S extends Store> = (path: Array<PathEntry>, params: Array<any>) => S
