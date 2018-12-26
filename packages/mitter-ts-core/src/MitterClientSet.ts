import { MitterApiConfiguration } from './MitterApiConfiguration'
import { PlatformImplementedFeatures } from './models/platformImplementedFeatures'
import { ChannelsClient, MessagesClient, UsersClient } from './services'
import { UserTokensClient } from './services/UserTokensClient'

export class MitterClientSet {
    private cachedClients: { [clientName: string]: any } = {}
    private client = <T>(clientConstructor: {
        new (
            mitterApiConfiguration: MitterApiConfiguration,
            platformImplementedFeatures: PlatformImplementedFeatures
        ): T
    }): T => {
        if (!(clientConstructor.name in this.cachedClients)) {
            this.cachedClients[clientConstructor.name] = new clientConstructor(
                this.mitterApiConfiguration,
                this.platformImplementedFeatures
            )
        }

        return this.cachedClients[clientConstructor.name] as T
    }

    constructor(
        private mitterApiConfiguration: MitterApiConfiguration,
        private platformImplementedFeatures: PlatformImplementedFeatures
    ) {}

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
}
