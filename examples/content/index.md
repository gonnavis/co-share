# co-share

Javascript framework for easily building shared applications such as chats and games

`npm i co-share`

## **When to use**

Building **multiuser applications for the web** is often challenging as asynchronous communication can drastically increase the system complexity.
Writing **robust and performant shared applications** requires a structured and fitting architecture.

We propose the abstraction of **shared stores** to distribute logic and data between participating systems.
By using Javascript & Node.js, the same code can be used on the client and the server to carry out the **platform-independent communication**.

## [**Tutorial**](https://cocoss-org.github.io/co-share/counter)

We will build a global synchronized counter that can be increased by every client.

## [**Examples**](https://cocoss-org.github.io/co-share)

_The code for each example can be found on the respective pages_

-   [Request](https://cocoss-org.github.io/co-share/request) - request response paradigma
<!-- * [Group Chat](https://cocoss-org.github.io/co-share/group-chat) - a whatsapp like chat implementation -->
-   [Message](https://cocoss-org.github.io/co-share/message) - direct client to client messaging without any persistent storage in between
-   [Lockable](https://cocoss-org.github.io/co-share/lockable) - advanced lock functionality to prevent editing by multiple people simultaneously
-   [Optimistic Lockable](https://cocoss-org.github.io/co-share/optimistic-lockable) - performance optimize lockable that allows for optimistic behaviour and error correction
-   [Whiteboard](https://cocoss-org.github.io/co-share/whiteboard) - collaborative drawing on a shared whiteboard
-   [Transformable](https://cocoss-org.github.io/co-share/transformable) - shared 3D transformation

---

-   [Networked Counter using SocketIO](https://github.com/cocoss-org/co-share-socketio-counter-example) - just like the counter from the tutorial but with a server/client architecture using SocketIO