import { Channel } from '@mitter-io/models'
import { Pagination } from './PaginationInterface'

export class ChannelListPaginationManager implements Pagination<Channel> {
    before: string | undefined
    after: string | undefined

    constructor( private getChannelFn: (before: string | undefined, after: string | undefined) => Promise<Channel[]> ) {}

    private updatePageDetails(channelList: Channel[]) {
        if (channelList.length > 0) {
            this.before = channelList[channelList.length - 1].channelId!
            this.after = channelList[0].channelId!
        }
    }

    async nextPage(): Promise<Channel[]> {
        const channelList = await (this.getChannelFn(
            undefined,
            this.after,
        ) as Promise<Channel[]>)
        this.updatePageDetails(channelList)
        return channelList
    }

    async prevPage(): Promise<Channel[]> {
        const channelList = await (this.getChannelFn(
            this.before,
            undefined,
        ) as Promise<Channel[]>)
        this.updatePageDetails(channelList)
        return channelList
    }
}
