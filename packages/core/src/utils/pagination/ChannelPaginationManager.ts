import { Channel } from '@mitter-io/models'
import { Pagination } from './PaginationInterface'

export class ChannelListPaginationManager implements Pagination<Channel> {
    before: string | undefined
    after: string | undefined
    countOffset: number | undefined

    constructor(
        private getChannelFn: (before: string | undefined, after: string | undefined, countOffset: number | undefined) => Promise<Channel[]>,
        public limit: number,
        private paginateUsingCountOffset?: boolean,
        private initCountOffset?: number
    )
    {
        if(this.paginateUsingCountOffset) {
            this.countOffset = this.initCountOffset || 0
        }
    }

    private updatePageDetails(channelList: Channel[], order: 'next' | 'prev') {
        if (channelList.length > 0) {
            if(!this.paginateUsingCountOffset) {
                if(order === 'prev') {
                    this.before = channelList[channelList.length - 1].channelId!
                    this.after = channelList[0].channelId!
                }
                else {
                    this.before = channelList[0].channelId!
                    this.after = channelList[channelList.length - 1].channelId!
                }
            }
            else {
                    this.countOffset = this.countOffset! + channelList.length
            }

        }
    }

    async nextPage(): Promise<Channel[]> {
        const channelList = await (this.getChannelFn(
            undefined,
            this.after,
            this.countOffset
        ) as Promise<Channel[]>)
        this.updatePageDetails(channelList, 'next')
        return channelList
    }

    async prevPage(): Promise<Channel[]> {
        let countOffset = undefined
        if(this.paginateUsingCountOffset) {
            countOffset = this.countOffset! - this.limit
            countOffset = countOffset < 0 ? 0 : countOffset
        }
        const channelList = await (this.getChannelFn(
            this.before,
            undefined,
            countOffset
        ) as Promise<Channel[]>)
        this.updatePageDetails(channelList, 'prev')
        return channelList
    }
}
