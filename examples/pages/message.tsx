import { useChildStore } from "co-share/react"
import React, { useMemo, useRef } from "react"
import create from "zustand"
import { Store } from "co-share"
import { MessagesStore } from "../stores/message"
import { Simulator } from "../components/simulator"
import { Header } from "../components/header"
import MD from "../content/message.md"
import { Footer } from "../components/footer"

export default function Index() {
    return (
        <div className="d-flex flex-column fullscreen">
            <Header selectedIndex={2} />
            <div className="d-flex flex-column justify-content-stretch container-lg">
                <div className="d-flex flex-row-responsive">
                    <Simulator
                        twoClients
                        initStore={(rootStore) => rootStore.addChildStore(new MessagesStore([]), false, "messages")}>
                        {(rootStore) => <MessagesSamplePage rootStore={rootStore} />}
                    </Simulator>
                </div>
                <div className="p-3 flex-basis-0 flex-grow-1">
                    <MD />
                </div>
            </div>
            <Footer />
        </div>
    )
}

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
