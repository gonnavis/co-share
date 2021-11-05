import { Action, Store, StoreLink, Subscriber } from "co-share"
import { Subject } from "rxjs"

export type Line = {
    color: string
    x0: number
    y0: number
    x1: number
    y1: number
}

export class WhiteboardStore extends Store {
    public lines: Array<Line>
    public linesSubject = new Subject<Line>()

    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber<WhiteboardStore, [Array<Line>]> = Subscriber.create(
        WhiteboardStore,
        (connection, accept, deny) => accept(this.lines)
    )

    constructor(lines: Array<Line>) {
        super()
        this.lines = lines
    }

    public addLine = Action.create(this, "addLine", (origin, line: Line) => {
        this.lines.push(line)
        this.linesSubject.next(line)
        this.addLine.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, line)
    })
}
