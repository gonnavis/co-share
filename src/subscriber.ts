import { Connection } from "./connection"
import { Store } from "./store"

export const Subscriber = {
    create<S extends Store, Params extends Array<any>>(
        storeClass: { new (...params: Array<any>): S },
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

export type SubscriberGetParams<S extends Subscriber<Store, Array<any>>> = S extends Subscriber<Store, infer T> ? T : never

export type Subscriber<S extends Store, Params extends Array<any>> = SubscriberFn<Params> & {
    storeClass: { new (...params: Array<any>): S }
}
