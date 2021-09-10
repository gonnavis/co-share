import { Action, isBrowser, Store, StoreLink, Subscriber } from "co-share"
import create, { StoreApi } from "zustand/vanilla"

export class MessagesStore extends Store {
    public state: StoreApi<{ clients: Array<string>; messages: Array<{ senderId: string; message: string }> }>

    public subscriber: Subscriber = Subscriber.create(MessagesStore, (connection, accept, deny) => {
        this.addClient({
            ...connection.userData,
        })
        accept(this.state.getState().clients.filter((id) => id != connection.userData.id))
    })

    public sendMessage = Action.create(
        this,
        "send-message",
        (origin, senderId: string, receiverId: string, message: string) => {
            if (origin == null) {
                this.sendMessage.publishTo({ to: "one", one: this.links[0] }, senderId, receiverId, message)
            } else  {
                this.state.setState({
                    messages: [...this.state.getState().messages, { message, senderId }],
                })
            } else {
                const link = this.links.find((link) => link.connection.userData.id === receiverId)
                if (link == null) {
                    throw `unable to find connection with receiver id ${receiverId}`
                }
                this.sendMessage.publishTo({ to: "one", one: link }, senderId, receiverId, message)
            }
        }
    )

    constructor(clients: Array<string>) {
        super()
        this.state = create<{ clients: Array<string>; messages: Array<{ senderId: string; message: string }> }>(
            () => ({ messages: [], clients })
        )
    }

    public onLink(link: StoreLink): void {}

    private addClient = Action.create(this, "addClient", (origin, clientInfo: string) => {
        this.state.setState({
            clients: [...this.state.getState().clients, clientInfo],
        })
        this.addClient.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, clientInfo)
    })

    private removeClient = Action.create(this, "removeClient", (origin, clientId: string) => {
        this.state.setState({
            clients: this.state.getState().clients.filter(({ id }) => id !== clientId),
        })
        this.removeClient.publishTo(origin == null ? { to: "all" } : { to: "all-except-one", except: origin }, clientId)
    })

    public onUnlink(link: StoreLink): void {
        this.removeClient(link.connection.userData.id)
    }
}
