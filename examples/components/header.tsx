const pages: Array<{ title: string; url: string }> = [
    {
        title: "Counter",
        url: "/counter",
    },
    {
        title: "Request",
        url: "/request",
    },
    {
        title: "Message",
        url: "/message",
    },
    {
        title: "Group Chat",
        url: "/group-chat",
    },
    {
        title: "Lockable",
        url: "/lockable",
    },
    {
        title: "Optimistic Lockable",
        url: "/optimistic-lockable",
    },
    {
        title: "Whiteboard",
        url: "/whiteboard",
    },
    {
        title: "Transformable",
        url: "/transformable",
    },
]

export function Header({ selectedIndex }: { selectedIndex: number }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    co-share examples
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNavDropdown"
                    aria-controls="navbarNavDropdown"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="align-self-flex-end collapse navbar-collapse" id="navbarNavDropdown">
                    <ul className="navbar-nav">
                        {pages.map(({ title, url }, index) => (
                            <li key={title} className="nav-item">
                                <a className={`nav-link ${index === selectedIndex ? "active" : ""}`} href={url}>
                                    {title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}
