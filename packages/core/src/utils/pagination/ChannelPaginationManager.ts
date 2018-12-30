import { Channel } from '@mitter-io/models'
import { ChannelsClient } from '../../services'
import { Pagination } from './PaginationInterface'

export default class ChannelListPaginationManager implements Pagination<Channel> {
    before: string | undefined
    after: string | undefined

    constructor(public limit: number, private channelsClient: ChannelsClient) {}

    private updatePageDetails(channelList: Channel[]) {
        if (channelList.length > 0) {
            this.before = channelList[channelList.length - 1].channelId!
            this.after = channelList[0].channelId!
        }
    }

    async nextPage(): Promise<Channel[]> {
        const channelList = await (this.channelsClient.getAllChannels(
            undefined,
            this.after,
            this.limit
        ) as Promise<Channel[]>)
        this.updatePageDetails(channelList)
        return channelList
    }

    async prevPage(): Promise<Channel[]> {
        const channelList = await (this.channelsClient.getAllChannels(
            this.before,
            undefined,
            this.limit
        ) as Promise<Channel[]>)
        this.updatePageDetails(channelList)
        return channelList
    }
}
