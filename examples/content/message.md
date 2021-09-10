# Message Example

Let's see how it works ...

```typescript
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
```

```typescript
export function MessagesSamplePage({ rootStore }: { rootStore: Store }) {
    const store = useChildStore(rootStore, rootStore.links[0], MessagesStore, 1000, "messages")

    const id = useMemo(() => rootStore.links[0].connection.userData.id, [rootStore])
    const useStoreState = useMemo(() => create(store.state), [store])

    const messages = useStoreState((store) => store.messages)
    const clients = useStoreState((store) => store.clients)

    return (
        <div>
            <h5>Clients</h5>
            {clients.map((client) => (
                <Client sendMessage={store.sendMessage.bind(store, id)} client={client} key={client.id} />
            ))}
            <h5>Messages</h5>
            <div>
                {messages.map(({ message, senderId }, index) => (
                    <Message key={index} clients={clients} senderId={senderId} message={message} />
                ))}
            </div>
        </div>
    )
}

export function Client({ sendMessage }: { sendMessage: (receiverId: string, message: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)
    return (
        <div>
            <span>{client.username}</span>
            <input ref={inputRef}></input>
            <button
                onClick={() => {
                    if (inputRef.current != null) {
                        sendMessage(client.id, inputRef.current.value)
                        inputRef.current.value = ""
                    }
                }}>
                send
            </button>
        </div>
    )
}

export function Message({
    message,
    senderId,
    clients,
}: {
    message: string
    senderId: string
    clients: Array<ClientInfo>
}) {
    const senderName = useMemo(
        () => clients.find(({ id }) => id === senderId)?.username ?? "unkown",
        [senderId, clients]
    )
    return (
        <div>
            {senderName}: {message}
        </div>
    )
}
```
