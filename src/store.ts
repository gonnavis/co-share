import { from, Observable, of, Subject, throwError } from "rxjs"
import { filter, tap, takeUntil, finalize, map } from "rxjs/operators"
import { Connection, StoreLink, StoreLinkId } from "."
import { ActionIdentifier, Action } from "./action"
import { Request } from "./request"
import { Subscriber } from "./subscriber"

export type PathEntry = string | number

export abstract class Store {
    public parentStore: Store | undefined

    public get links(): ReadonlyArray<StoreLink> {
        return Array.from(this.linkSet.values())
    }

    private linkSet = new Set<StoreLink>()

    public readonly childStoreMap = new Map<PathEntry, Store>()

    public readonly actionMap = new Map<ActionIdentifier, Action<Array<any>>>()

    public abstract subscriber: Subscriber<Store, Array<any>>

    public abstract onUnlink(link: StoreLink): void

    public abstract onLink(link: StoreLink): void

    public log = Action.create(this, "log", (origin, log: any) => console.log(origin, log))

    public addChildStore(
        store: Store,
        overwrite: boolean,
        ...[firstPathEntry, ...rest]: [PathEntry, ...Array<PathEntry>]
    ) {
        if (rest.length > 0) {
            const childStore = this.childStoreMap.get(firstPathEntry)
            if (childStore == null) {
                throw `unable to find child in store at path entry "${firstPathEntry}"`
            }
            childStore.addChildStore(store, overwrite, ...(rest as [PathEntry, ...Array<PathEntry>]))
        } else {
            if (overwrite || !this.childStoreMap.has(firstPathEntry)) {
                store.parentStore = this
                this.childStoreMap.set(firstPathEntry, store)
            } else {
                throw `Store "${firstPathEntry}" already exists on store (${store}). If you want to overwrite the store, set the overwrite parameter to true.`
            }
        }
    }

    public removeChildStore(...[firstPathEntry, ...rest]: [PathEntry, ...Array<PathEntry>]) {
        if (rest.length > 0) {
            const childStore = this.childStoreMap.get(firstPathEntry)
            if (childStore == null) {
                throw `unable to find child in store at path entry "${firstPathEntry}"`
            }
            childStore.parentStore = undefined
            childStore.removeChildStore(...(rest as [PathEntry, ...Array<PathEntry>]))
        } else {
            this.childStoreMap.delete(firstPathEntry)
        }
    }

    subscribeToChild<S extends Store>(
        storeConstr: new (...params: Array<any>) => S,
        link: StoreLink,
        ...path: [PathEntry, ...Array<PathEntry>]
    ): Observable<[S, StoreLink]> {
        const newLinkId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        return this.requestSubscribeToChild.publishTo(link, newLinkId, ...path).pipe(
            map((params) => {
                const store = new storeConstr(...params)
                const newLink = store.link(newLinkId, link.connection)
                return [store, newLink]
            })
        )
    }

    private requestSubscribeToChild: Request<[id: StoreLinkId, ...path: [PathEntry, ...Array<PathEntry>]], Array<any>> =
        Request.create(
            this,
            "requestSubscribeToChild",
            (origin: StoreLink | undefined, id: StoreLinkId, ...path: [PathEntry, ...Array<PathEntry>]) => {
                if (origin == null) {
                    throw `subscribeToChild can only be executed remotely using "publish"`
                }
                const [firstPathEntry, ...restPath] = path
                const childStore = this.childStoreMap.get(firstPathEntry)
                if (childStore == null) {
                    return throwError(`unable to find child in store at path entry "${firstPathEntry}"`)
                }
                if (restPath.length === 0) {
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
                } else {
                    return childStore.requestSubscribeToChild.forwardFrom(
                        origin,
                        id,
                        ...(restPath as [PathEntry, ...Array<PathEntry>])
                    )
                }
            }
        )

    unsubscribe = Action.create(this, "unsubscribe", (origin) => {
        if (origin == null) {
            throw "can't execute usubscribe locally"
        }
        this.unlink(origin)
    })

    private unlink(link: StoreLink) {
        this.linkSet.delete(link)
        this.onUnlink(link)
    }

    link(id: StoreLinkId, connection: Connection): StoreLink {
        const onDisconnect = new Subject<void>()
        const storeLink: StoreLink = {
            connection,
            close: () => onDisconnect.next(),
            publish: (actionName, ...params) => connection.publish(id, actionName, ...params),
        }
        this.linkSet.add(storeLink)
        this.onLink(storeLink)
        connection
            .receive()
            .pipe(
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
                takeUntil(onDisconnect),
                finalize(() => this.unlink(storeLink))
            )
            .subscribe()
        return storeLink
    }

    close(): void {
        this.links.forEach((link) => link.close())
    }
}
