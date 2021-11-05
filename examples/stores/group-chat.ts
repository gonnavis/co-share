import { Action, isBrowser, Request, RootStore, Store, StoreLink, Subscriber } from "co-share"
import { StoreApi } from "zustand"
import create from "zustand/vanilla"
import { v4 as uuid } from "uuid"
import { of } from "rxjs"
import { tap } from "rxjs/operators"

export type Group = { id: string; name: string }

export class GroupChatListStore extends Store {
    public subscriber: Subscriber<GroupChatListStore, [Array<Group>]> = Subscriber.create(
        GroupChatListStore,
        (connection, accept) => accept(this.state.getState().groups)
    )
    public state: StoreApi<{ groups: Array<Group> }>

    constructor(public readonly rootStore: RootStore, groups: Array<Group>) {
        super()
        this.state = create(() => ({ groups }))
    }

    public createGroup: Request<this, [name: string], string> = Request.create(
        this,
        "createGroup",
        (origin, name: string) => {
            if (origin != null) {
                const id = uuid()
                const groupStore = new GroupChatStore([], undefined)
                this.rootStore.addStore(groupStore, id)
                this.addGroup(id, name)
                this.addGroup.publishTo({ to: "all-except-one", except: origin }, id, name)
                return of(id)
            } else {
                return this.createGroup.publishTo(this.mainLink, name).pipe(tap((id) => this.addGroup(id, name)))
            }
        }
    )

    private addGroup = Action.create(this, "addGroup", (origin, id: string, name: string) => {
        this.state.setState({
            groups: [...this.state.getState().groups, { id, name }],
        })
    })

    public deleteGroup = Action.create(this, "deleteGroup", (origin, id: string) => {
        this.state.setState({
            groups: this.state.getState().groups.filter((group) => group.id !== id),
        })
        const store = this.rootStore.storeMap.get(id)
        if (origin != null && store != null && store instanceof GroupChatStore && store.ownId == null) {
            //workarround to now if we are on the server
            this.rootStore.destroyStore(store, id)
        }
        this.deleteGroup.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, id)
    })

    public editGroup = Action.create(this, "editGroup", (origin, id: string, name: string) => {
        this.state.setState({
            groups: this.state.getState().groups.map((group) => (group.id === id ? { id, name } : group)),
        })
        this.editGroup.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, id, name)
    })

    public onUnlink(link: StoreLink): void {}
    public onLink(link: StoreLink): void {}
}

export type Message = {
    sender: string
    text: string
}

export class GroupChatStore extends Store {
    public subscriber: Subscriber<GroupChatStore, [messages: Array<Message>, ownId: string | undefined]> =
        Subscriber.create(GroupChatStore, (connection, accept) =>
            accept(this.state.getState().messages, connection.userData.id)
        )
    public state: StoreApi<{ messages: Array<Message> }>

    constructor(messages: Array<Message>, public readonly ownId: string | undefined) {
        super()
        this.state = create(() => ({ messages }))
    }

    public sendMessage = Action.create(this, "sendMessage", (origin, text: string) => {
        if (origin == null) {
            if (this.ownId != null) {
                this.addMessage(this.ownId, text)
                this.sendMessage.publishTo({ to: "all" }, text)
            }
        } else {
            this.publishMessage.forwardFrom(origin, origin.connection.userData.id, text)
        }
    })

    private publishMessage = Action.create(this, "publishMessage", (origin, sender: string, text: string) => {
        this.addMessage(sender, text)
        this.publishMessage.publishTo(
            origin == null ? { to: "all" } : { to: "all-except-one", except: origin },
            sender,
            text
        )
    })

    private addMessage(sender: string, text: string) {
        this.state.setState({
            messages: [
                ...this.state.getState().messages,
                {
                    sender,
                    text,
                },
            ],
        })
    }

    public onUnlink(link: StoreLink): void {}
    public onLink(link: StoreLink): void {}
}
