# co-share

A js/Node.js framework for easily building shared applications such as group-chats or even collaboration apps like google docs. 

`npm i co-share`

## **When to use**

Building **multiuser applications for the web** is often challenging as asynchronous communication can drastically increase the system complexity.
Writing **robust and performant shared applications** requires a structured and fitting architecure.

We propose the abstraction of **shared stores** to distribute logic and data between participating system.
By using js & node.js the same code can be used on the client and on the server to carry out the **platform indepedent communication**.

## **How to use**

The library is framework independent as it runs on the `Web` and `NodeJS`. However, we provide `react` hooks out of the box to simplify the experience. *Please help us to build tools for more web frameworks.*

```typescript
new Example extends Store {
    action = Action.create(this, "actionName", (origin, parameter) => {
        action.publishTo(
            origin == null ?
                { to: "all" } :
                { to: "all-except-one", except: origin },
            parameter
        )
    })
}
```

The `Stores` contain both, the **platform indepedent logic** and the **data**. Platform independent logic is specified as `Action`s, which are methods that can be invoked on a remote client. Above, we use `publishTo` to make the store execute the given action with the provided `parameter` on all other nodes in the network.


## [**Examples**](https://cocoss-org.github.io/co-share)

* [Counter](https://cocoss-org.github.io/co-share/counter) - a global synchronized counter that can be increased asynchronously by every client
* [Request](https://cocoss-org.github.io/co-share/request) - request response paradigma
* [Group Chat](https://cocoss-org.github.io/co-share/group-chat) - a whatsapp like chat implementation
* [Message](https://cocoss-org.github.io/co-share/message) - direct client to client messaging without any persistent storage in between
* [Lockable](https://cocoss-org.github.io/co-share/lockable) - advanced lock functionality to prevent editing by multiple people simultaneously 
* [Optimistic Lockable](https://cocoss-org.github.io/co-share/optimistic-lockable) - performance optimize lockable that allows for optimistic behaviour and error correction
* [Whiteboard](https://cocoss-org.github.io/co-share/whiteboard) - collaborative drawing on a shared whiteboard
* [Transformable](https://cocoss-org.github.io/co-share/transformable) - shared 3D transformation

## Example Architecture

![Sample Architecture Graph](graph.svg)

In a multiuser scenario stores are connected using `StoreLink`s. One Store can have 0-N `StoreLink`s to other participants.

## **In depth description**

This framework revolves around the idea of **Stores** which can represent any entity or information. A **Store** is a class which may contain a set of **Actions** which are methods which can be executed remotely. The communication for executing an action remotely is carried out by the connection of your choice, for instance with socketio.

However, executing an **Action** requires an established **StoreLink** for a connection. This **StoreLink** uniquely identifies the relation between local store and remote store and vice versa.
Setting up a **StoreLink** can either be done manually or automatically by **subscribing** to a certain **Store**. Subscribing to a **Store** triggeres the initial parameters from the host **Store** to be fetched. The parameters are provided by a **Subscriber** running on every **Store** to determine if and what a requesting client should know about the **Store**.

**Store**s can be organized in a hierachical manner since every store holds a list of child **Store**s, which can be adapted at runtime. **Subscribing** to a **Store** requires to execute the _requestSubscribeToChild_ **Request**, which exists on every **Store**. **Request**s are defined through **Action**s internally and allow to have asynchronous return values for remote logic invocation.

## Supporting Packages

-   **co-share-socketio** - networking implementation using [socketio](https://github.com/socketio/socket.io)
-   **co-share-peer** - p2p audio/video/data streaming/communication using [simple-peer](https://github.com/feross/simple-peer)
-   **co-share-geckosio** - _Idea_ - networking implementation using [geckosio](https://github.com/geckosio/geckos.io)
