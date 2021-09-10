import { Store, StoreLink, Subscriber } from "co-share"

export class RootStore extends Store {
    public onUnlink(link: StoreLink): void {}

    public onLink(link: StoreLink): void {}

    public subscriber: Subscriber = Subscriber.create(RootStore, (connection, accept, deny) => accept())

}
