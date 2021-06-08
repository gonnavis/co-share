export type TimeStep<T> = (current: Readonly<T>) => T

export class History<T> {
    private presenceHistoryEntry: HistoryEntry<T>

    public get presence(): T {
        return this.presenceHistoryEntry.state
    }

    constructor(presence: T, private onChange: (presence: T) => void) {
        this.presenceHistoryEntry = {
            state: Object.freeze(presence),
            timeStep: () => {
                throw "beginning time step can't be executed"
            },
            stable: true,
            futureHistoryEntry: undefined,
            pastHistoryEntry: undefined,
        }
    }

    private pNext(timeStep: TimeStep<T>, stable: boolean): HistoryEntry<T> {
        const presenceHistoryEntry: HistoryEntry<T> = this.presenceHistoryEntry
        const keepPrev = !stable || presenceHistoryEntry.pastHistoryEntry != null
        const futureHistoryEntry: HistoryEntry<T> = {
            state: Object.freeze(timeStep(presenceHistoryEntry.state)),
            timeStep,
            futureHistoryEntry: undefined,
            pastHistoryEntry: keepPrev ? presenceHistoryEntry : undefined,
            stable,
        }
        presenceHistoryEntry.futureHistoryEntry = futureHistoryEntry
        this.presenceHistoryEntry = futureHistoryEntry
        this.onChange(this.presenceHistoryEntry.state)
        return futureHistoryEntry
    }

    next(timeStep: TimeStep<T>): void {
        this.pNext(timeStep, true)
    }

    /**
     * @returns a function that allows to remove or keep the time step
     */
    maybeNext(timeStep: TimeStep<T>): (keep: boolean) => void {
        const futureHistoryEntry = this.pNext(timeStep, false)
        return (keep: boolean) => {
            if (futureHistoryEntry.pastHistoryEntry == null) {
                throw "future history event's past entry can't be empty"
            }

            if (keep) {
                //make stable
                futureHistoryEntry.stable = true
            } else {
                //remove
                futureHistoryEntry.pastHistoryEntry.futureHistoryEntry = futureHistoryEntry.futureHistoryEntry
                if (futureHistoryEntry.futureHistoryEntry != null) {
                    futureHistoryEntry.futureHistoryEntry.pastHistoryEntry = futureHistoryEntry.pastHistoryEntry
                }
            }

            let iteratorHistoryEntry = futureHistoryEntry.pastHistoryEntry
            while (iteratorHistoryEntry.futureHistoryEntry != null) {
                if (iteratorHistoryEntry.pastHistoryEntry == null && iteratorHistoryEntry.futureHistoryEntry.stable) {
                    //cleaning past to get the smallest possible past chain (maximum one stable element at the end)
                    iteratorHistoryEntry.futureHistoryEntry.pastHistoryEntry = undefined
                }
                iteratorHistoryEntry.futureHistoryEntry.state = Object.freeze(
                    iteratorHistoryEntry.futureHistoryEntry.timeStep(iteratorHistoryEntry.state)
                )
                iteratorHistoryEntry = iteratorHistoryEntry.futureHistoryEntry
            }

            if (!keep) {
                //publish new presence
                this.presenceHistoryEntry = iteratorHistoryEntry
                this.onChange(this.presenceHistoryEntry.state)
            }
        }
    }

    logStableChain(): void {
        let iterator = this.presenceHistoryEntry
        let chain = iterator.stable + ""
        while (iterator.pastHistoryEntry != null) {
            iterator = iterator.pastHistoryEntry
            chain = iterator.stable + "->" + chain
        }
        console.log(chain)
    }
}

type HistoryEntry<T> = {
    state: Readonly<T>
    timeStep: TimeStep<T>
    futureHistoryEntry: HistoryEntry<T> | undefined
    pastHistoryEntry: HistoryEntry<T> | undefined
    stable: boolean
}
