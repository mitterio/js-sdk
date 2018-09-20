import { MitterAxiosInterceptionHost } from './Mitter'
import { ChannelsClient, MessagesClient, UsersClient } from './services'
import { UserTokensClient } from './services/UserTokensClient'

export class MitterClientSet {
    private cachedClients: { [clientName: string]: any } = {}

    constructor(private mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) {}

    channels() {
        return this.client(ChannelsClient)
    }

    messages() {
        return this.client(MessagesClient)
    }

    users() {
        return this.client(UsersClient)
    }

    userAuth() {
        return this.client(UserTokensClient)
    }

    private client<T>(clientConstructor: {
        new (mitterAxiosInterceptionHost: MitterAxiosInterceptionHost): T
    }): T {
        if (!(clientConstructor.name in this.cachedClients)) {
            this.cachedClients[clientConstructor.name] = new clientConstructor(
                this.mitterAxiosInterceptionHost
            )
        }

        return this.cachedClients[clientConstructor.name] as T
    }
}
