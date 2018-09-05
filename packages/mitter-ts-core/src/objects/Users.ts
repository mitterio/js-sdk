import channelsClientProvider, { MitterChannels } from '../services/channels'
import { Mitter } from '../Mitter'
import { Channel } from 'mitter-models'

export default class User {
    private readonly channelsClient: MitterChannels
    private readonly userId: string

    constructor(private readonly mitter: Mitter, userId: string | undefined = undefined) {
        this.channelsClient = channelsClientProvider(mitter)

        if (userId === undefined) {
            this.userId = 'me'
        } else {
            this.userId = userId
        }
    }

    async participatedChannels(): Promise<Channel[]> {
        return this.channelsClient.getParticipatedChannels(this.userId)
    }
}
