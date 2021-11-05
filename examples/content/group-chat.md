# Group Chat Example Source Code

[`group-chat.ts`](https://github.com/cocoss-org/co-share/blob/master/examples/stores/group-chat.ts)

```typescript
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
```


[`group-chat.tsx`](https://github.com/cocoss-org/co-share/blob/master/examples/pages/group-chat.tsx)

```typescript
export function GroupChatExamplePage({ rootStore }: { rootStore: RootStore }) {
    const store = useStoreSubscription(
        "group-chat-list",
        1000,
        (groups: Array<Group>) => new GroupChatListStore(rootStore, groups),
        undefined,
        rootStore
    )

    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined)
    const inputRef = useRef<HTMLInputElement>(null)

    const useStoreState = useMemo(
        () =>
            create<{
                groups: Group[]
            }>(store.state),
        [store]
    )

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
            }}
            className="p-3">
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
                    <div
                        className="d-flex align-items-center justify-content-between"
                        key={group.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedGroupId(group.id)}>
                        <span className={groupId === group.id ? "fw-bold" : ""}>{group.name}</span>
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
                    <Suspense fallback={<span>Loading ...</span>}>
                        <GroupChat groupId={groupId} rootStore={rootStore} />
                    </Suspense>
                )}
            </div>
        </div>
    )
}

function GroupChat({ rootStore, groupId }: { groupId: string; rootStore: RootStore }) {
    const groupChatStore = useStoreSubscription(
        groupId,
        1000,
        (messages: Array<Message>, ownId: string | undefined) => new GroupChatStore(messages, ownId),
        undefined,
        rootStore
    )

    //buggy: guess: suspense will not unmount this component and thus the api is not resubscribed
    const useStoreState = useMemo(() => create<{ messages: Message[] }>(groupChatStore.state), [groupChatStore])
    const { messages } = useStoreState()

    const inputRef = useRef<HTMLInputElement>(null)

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
