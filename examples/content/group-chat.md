# Group Chat Example

Let's see how it works ...

```typescript
export type Group = { id: string; name: string }

export class GroupChatListStore extends Store {
    public subscriber: Subscriber = Subscriber.create(GroupChatListStore, (connection, accept) =>
        accept(this.state.getState().groups)
    )
    public state: StoreApi<{ groups: Array<Group> }>

    constructor(groups: Array<Group>) {
        super()
        this.state = create(() => ({ groups }))
    }

    public createGroup: Request<[name: string], string> = Request.create(
        this,
        "createGroup",
        (origin, name: string) => {
            if (origin != null) {
                const id = uuid()
                const groupStore = new GroupChatStore([], undefined)
                this.addChildStore(groupStore, false, id)
                this.addGroup(id, name)
                this.addGroup.publishTo({ to: "all-except-one", except: origin }, id, name)
                return of(id)
            } else {
                return this.createGroup.publishTo(this.links[0], name).pipe(tap((id) => this.addGroup(id, name)))
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
        const store = this.childStoreMap.get(id)
        if (origin != null && store != null) {
            store.close()
            this.removeChildStore(id)
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
    public subscriber: Subscriber = Subscriber.create(GroupChatStore, (connection, accept) =>
        accept(this.state.getState().messages, connection.userData.id)
    )
    public state: StoreApi<{ messages: Array<Message> }>

    constructor(messages: Array<Message>, private readonly ownId: string | undefined) {
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
```

```typescript
export function GroupChatExamplePage({ rootStore }: { rootStore: Store }) {
    const store = useChildStore(rootStore, rootStore.links[0], GroupChatListStore, 1000, "group-chat-list")

    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined)
    const inputRef = useRef<HTMLInputElement>(null)

    const useStoreState = useMemo(() => create(store.state), [store])

    const { groups } = useStoreState()
    const groupId = useMemo(
        () =>
            selectedGroupId != null && groups.find((group) => group.id === selectedGroupId) != null
                ? selectedGroupId
                : groups.length > 0
                ? groups[0].id
                : undefined,
        [groups, selectedGroupId]
    )

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "stretch",
                flexGrow: 1,
            }}>
            <div style={{ maxWidth: 300, width: "100%" }}>
                <h1>Groups</h1>
                <div className="input-group mb-3">
                    <input
                        ref={inputRef}
                        style={{ flexGrow: 1 }}
                        type="text"
                        className="form-control"
                        placeholder="Group Name"
                    />
                    <div className="input-group-append">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                                if (inputRef.current != null && inputRef.current.value.length > 0) {
                                    store.createGroup(inputRef.current.value).subscribe()
                                }
                            }}
                            type="button">
                            Create
                        </button>
                    </div>
                </div>
                {groups.map((group) => (
                    <div key={group.id} style={{ cursor: "pointer" }} onClick={() => setSelectedGroupId(group.id)}>
                        {group.name}
                        <button className="btn btn-outline-danger" onClick={() => store.deleteGroup(group.id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ flexGrow: 1, display: "flex", alignItems: "stretch", justifyContent: "stretch" }}>
                {groupId == null ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                        Create a Group
                    </div>
                ) : (
                    <GroupChat groupId={groupId} store={store} />
                )}
            </div>
        </div>
    )
}

function GroupChat({ store, groupId }: { groupId: string; store: GroupChatListStore }) {
    const groupChatStore = useChildStore(store, store.links[0], GroupChatStore, 1000, groupId)
    const useStoreState = useMemo(() => create(groupChatStore.state), [store])

    const inputRef = useRef<HTMLInputElement>(null)

    const { messages } = useStoreState()
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
            {messages.map((message, index) => (
                <p key={index}>
                    <strong>{message.sender}</strong>: {message.text}
                </p>
            ))}
            <div style={{ flexGrow: 1 }}></div>
            <div className="input-group mb-3">
                <input
                    ref={inputRef}
                    style={{ flexGrow: 1 }}
                    type="text"
                    className="form-control"
                    placeholder="Message"
                />
                <div className="input-group-append">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => {
                            if (inputRef.current != null && inputRef.current.value.length > 0) {
                                groupChatStore.sendMessage(inputRef.current.value)
                            }
                        }}
                        type="button">
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
```
