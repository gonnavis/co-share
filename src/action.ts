import { filterNull, LogAction, Store, StoreLink } from "."

export type ActionIdentifier = string | number

export type ActionFunction<S extends Store, Params extends Array<any>> = (
    this: S,
    origin: StoreLink | undefined,
    ...params: Params
) => void

export type Action<S extends Store, Params extends Array<any>> = ((this: S, ...params: Params) => void) & {
    publishTo(targetDescription: PublishActionTargetDescription, ...params: Params): void
    forwardFrom(origin: StoreLink, ...params: Params): void
    identifier: ActionIdentifier
}

export type UnboundAction<S extends Store, Params extends Array<any>> = {
    publishTo(links: Readonly<Array<StoreLink>>, ...params: Params): void
    forwardFrom(store: S, origin: StoreLink, ...params: Params): void
    identifier: ActionIdentifier
    execute: ActionFunction<S, Params>
    bindTo(store: S, overwrite?: boolean): Action<S, Params>
}

function createUnboundAction<S extends Store, Params extends Array<any>>(
    identifier: ActionIdentifier,
    execute: ActionFunction<S, Params>
): UnboundAction<S, Params> {
    const publishTo: UnboundAction<S, Params>["publishTo"] = (links, ...params) =>
        links.forEach((link) => link.publish(identifier, ...params))
    const forwardFrom: UnboundAction<S, Params>["forwardFrom"] = (store, origin, ...params) => {
        try {
            execute.apply(store, [origin, ...params])
        } catch (error) {
            LogAction.publishTo([origin], error)
        }
    }
    return {
        publishTo,
        forwardFrom,
        execute,
        identifier,
        bindTo: (bindAction as any).bind(undefined, identifier, execute, publishTo, forwardFrom),
    }
}

const createAction = <S extends Store, Params extends Array<any>>(
    store: S,
    identifier: ActionIdentifier,
    fn: ActionFunction<S, Params>,
    overwrite = false
): Action<S, Params> => createUnboundAction(identifier, fn).bindTo(store, overwrite)

function bindAction<S extends Store, T extends Array<any>>(
    identifier: ActionIdentifier,
    execute: ActionFunction<S, T>,
    publishTo: UnboundAction<S, T>["publishTo"],
    forwardFrom: UnboundAction<S, T>["forwardFrom"],
    store: S,
    overwrite: boolean
): Action<S, T> {
    const action: Action<S, T> = Object.assign(execute.bind(store, undefined), {
        forwardFrom: forwardFrom.bind(undefined, store),
        publishTo: (targetDescription: PublishActionTargetDescription, ...params: T) => {
            const targets = convertActionTargetDescriptionToTargets(
                targetDescription,
                store.storeLinkCache
                    .findByPath(store.path)
                    .map((entry) => entry.get())
                    .filter(filterNull)
            )
            publishTo(targets, ...params)
        },
        identifier,
    })
    if (overwrite || !store.actionMap.has(identifier)) {
        store.actionMap.set(identifier, action as Action<S, Array<any>>)
    } else {
        throw `Action "${identifier}" already exists on store (${store}). If you want to overwrite the action, set the overwrite parameter to true.`
    }
    return action
}

function convertActionTargetDescriptionToTargets(
    description: PublishActionTargetDescription,
    links: ReadonlyArray<StoreLink>
): ReadonlyArray<StoreLink> {
    switch (description.to) {
        case "all":
            return links
        case "all-except-one":
            return links.filter((link) => link != description.except)
        case "all-except-multiple":
            return links.filter((link) => !description.except.includes(link))
        case "all-fiter":
            return links.filter(description.filter)
        case "one":
            return [description.one]
    }
}

export const Action = {
    create: createAction,
    createUnbound: createUnboundAction,
}

export type PublishActionTargetDescription =
    | {
          to: "one"
          one: StoreLink
      }
    | {
          to: "all-except-one"
          except: StoreLink
      }
    | {
          to: "all-except-multiple"
          except: Array<StoreLink>
      }
    | {
          to: "all-fiter"
          filter: (storeLink: StoreLink) => boolean
      }
    | {
          to: "all"
      }
