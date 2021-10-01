import { Store, StoreLink } from "."

export type ActionIdentifier = string | number

export const Action = {
    create: <Params extends Array<any>>(
        identifier: ActionIdentifier,
        fn: ActionFunction<Params>,
        overwrite = false
    ): UnbindedAction<Params> =>
        (store: Store) => {
        const action: Action<Params> = Object.assign(
            (...params: Params) => {
                fn(undefined, ...params)
            },
            {
                forwardFrom: (origin: StoreLink | undefined, ...params: Params) => {
                    try {
                        fn(origin, ...params)
                    } catch (error) {
                        if (origin != null) {
                            store.log.publishTo({ to: "one", one: origin }, error)
                        } else {
                            throw error
                        }
                    }
                },
                publishTo: (targetDescription: PublishActionTargetDescription, ...params: Params) => {
                    const targets = convertActionTargetDescriptionToTargets(targetDescription, store.storeLinkCache.findByPath(store.path).map(entry => entry.get()).filter(filterNull))
                    for (const target of targets) {
                        target.publish(identifier, ...params)
                    }
                },
                identifier,
            }
        )
        if (overwrite || !store.actionMap.has(identifier)) {
            store.actionMap.set(identifier, action as Action<Array<any>>)
        } else {
            throw `Action "${identifier}" already exists on store (${store}). If you want to overwrite the action, set the overwrite parameter to true.`
        }
        return action
    }
}

export function filterNull<S>(val: S | undefined): val is S {
    return val != null
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

export type ActionFunction<Params extends Array<any>> = (origin: StoreLink | undefined, ...params: Params) => void

export type Action<Params extends Array<any>> = ((...params: Params) => void) & {
    publishTo(targetDescription: PublishActionTargetDescription, ...params: Params): void
    forwardFrom(origin: StoreLink, ...params: Params): void
    identifier: ActionIdentifier
}

export type UnbindedAction<Params extends Array<any>> = (store: Store) => Action<Params>

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
