import { Connection } from "./connection"
import { Store } from "./store"

export const Subscriber = {
    create<S extends Store, Params extends Array<any>>(
        storeClass: { new (...params: Params): S },
        subscriber: SubscriberFn<Params>
    ): Subscriber<S, Params> {
        return Object.assign(subscriber, { storeClass })
    },
}

export type SubscriberFn<Params extends Array<any>> = (
    connection: Connection,
    accept: (...params: Params) => void,
    deny: (reason: string) => void
) => void

export type Subscriber<S extends Store = Store, Params extends Array<any> = Array<any>> = SubscriberFn<Params> & {
    storeClass: { new (...params: Params): S }
}
