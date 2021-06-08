import { EMPTY, merge, MonoTypeOperatorFunction, Observable, Subject, throwError } from "rxjs"
import { catchError, filter, take, takeUntil, tap } from "rxjs/operators"
import { Store } from "."
import { Action } from "./action"
import { StoreLink } from "./store-link"

export type RequestFunction<Params extends Array<any>, Result> = (
    origin: StoreLink | undefined,
    ...params: Params
) => Observable<Result>

export type Request<Params extends Array<any>, Result> = ((...params: Params) => Observable<Result>) & {
    publishTo(target: StoreLink, ...params: Params): Observable<Result>
    forwardFrom(origin: StoreLink, ...params: Params): Observable<Result>
}

export const Request = {
    create<Params extends Array<any>, Result>(
        store: Store,
        identifier: string,
        fn: RequestFunction<Params, Result>,
        multipleResponses = false,
        overwrite = false
    ): Request<Params, Result> {
        const catchedFn = (origin: StoreLink | undefined, ...params: Params) => {
            try {
                return fn(origin, ...params)
            } catch (error) {
                return throwError(error)
            }
        }

        const responseNextSubject = new Subject<[number, Result]>()
        const responseCompleteSubject = new Subject<number>()
        const responseErrorSubject = new Subject<[number, any]>()
        const cancelSubject = new Subject<number>()

        const responseNextActionName = `next_${identifier}`
        const responseErrorActionName = `error_${identifier}`
        const responseCompleteActionName = `complete_${identifier}`
        const requestActionName = `request_${identifier}`
        const cancelActionName = `cancel_${identifier}`

        const responseNextAction = Action.create<[number, Result]>(
            store,
            responseNextActionName,
            (origin, ...params) => responseNextSubject.next(params),
            overwrite
        )
        const responseErrorAction = Action.create<[number, any]>(
            store,
            responseErrorActionName,
            (origin, ...params) => responseErrorSubject.next(params),
            overwrite
        )
        const responseCompleteAction = Action.create<[number]>(
            store,
            responseCompleteActionName,
            (origin, id) => responseCompleteSubject.next(id),
            overwrite
        )

        const requestAction = Action.create<[number, ...Params]>(
            store,
            requestActionName,
            (target, id, ...params) => {
                if (target != null) {
                    catchedFn(target, ...params)
                        .pipe(
                            takeOneOptional(!multipleResponses),
                            tap(
                                (next) => responseNextAction.publishTo({ to: "one", one: target }, id, next),
                                (error) => responseErrorAction.publishTo({ to: "one", one: target }, id, error),
                                () => {
                                    if (multipleResponses) {
                                        responseCompleteAction.publishTo({ to: "one", one: target }, id)
                                    }
                                }
                            ),
                            catchError(() => EMPTY),
                            takeUntil(cancelSubject.pipe(filter((reqId) => reqId === id)))
                        )
                        .subscribe()
                }
            },
            overwrite
        )
        const cancelAction = Action.create(store, cancelActionName, (origin, id) => cancelSubject.next(id), overwrite)

        return Object.assign((...params: Params) => catchedFn(undefined, ...params), {
            forwardFrom: catchedFn,
            publishTo: (target: StoreLink, ...params: Params) => {
                return new Observable<Result>((subscriber) => {
                    const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
                    const filterId = filter<[number, any]>(([observableId]) => observableId === id)
                    let hasEnded = false
                    const subscription = merge(
                        responseNextSubject.pipe(
                            filterId,
                            takeOneOptional(!multipleResponses),
                            tap(([observableId, next]) => {
                                subscriber.next(next)
                                if (!multipleResponses) {
                                    hasEnded = true
                                    subscriber.complete()
                                }
                            })
                        ),
                        responseErrorSubject.pipe(
                            filterId,
                            tap(([observableId, error]) => {
                                hasEnded = true
                                subscriber.error(error)
                            })
                        ),
                        responseCompleteSubject.pipe(
                            filter((observableId) => observableId === id),
                            tap(() => {
                                hasEnded = true
                                subscriber.complete()
                            })
                        )
                    ).subscribe()
                    requestAction.publishTo({ to: "one", one: target }, id, ...params)
                    return () => {
                        if (!hasEnded) {
                            subscription.unsubscribe()
                            cancelAction.publishTo({ to: "one", one: target }, id)
                        }
                    }
                })
            },
        })
    },
}

export function takeOneOptional<T>(takeOne: boolean): MonoTypeOperatorFunction<T> {
    if (takeOne) {
        return take(1)
    } else {
        return (val: Observable<T>) => val
    }
}
