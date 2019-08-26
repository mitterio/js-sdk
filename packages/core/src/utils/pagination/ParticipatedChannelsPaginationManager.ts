import { Pagination } from './PaginationInterface'
import {ParticipatedChannel} from "@mitter-io/models";


export class ParticipatedChannelsPaginationManager implements Pagination<ParticipatedChannel> {
    before: string | undefined
    after: string | undefined
    countOffset: number | undefined

    constructor( private getChannelFn: (before: string | undefined, after: string | undefined, countOffset: number | undefined) => Promise<ParticipatedChannel[]>,
                    public limit: number,
                    private paginateUsingCountOffset?: boolean,
                    private initCountOffset?: number
    ) {
        if(this.paginateUsingCountOffset) {
            this.countOffset = this.initCountOffset || 0
        }
    }

    private updatePageDetails(participatedChannelList: ParticipatedChannel[], order: 'next' | 'prev') {
        if (participatedChannelList.length > 0) {
            if(!this.paginateUsingCountOffset) {
                if(order === 'prev') {
                    this.before = participatedChannelList[participatedChannelList.length - 1].channel.channelId!
                    this.after = participatedChannelList[0].channel.channelId!
                }
                else {
                    this.before = participatedChannelList[0].channel.channelId!
                    this.after = participatedChannelList[participatedChannelList.length - 1].channel.channelId!
                }
            }
            else {
                this.countOffset = this.countOffset! + participatedChannelList.length
            }
        }
    }

    async nextPage(): Promise<ParticipatedChannel[]> {
        const channelList = await (this.getChannelFn(
            undefined,
            this.after,
            this.countOffset
        ) as Promise<ParticipatedChannel[]>)
        this.updatePageDetails(channelList, 'next')
        return channelList
    }

    async prevPage(): Promise<ParticipatedChannel[]> {
        let countOffset = undefined
        if(this.paginateUsingCountOffset) {
            countOffset = this.countOffset! - this.limit
            countOffset = countOffset < 0 ? 0 : countOffset
        }
        const channelList = await (this.getChannelFn(
            this.before,
            undefined,
            countOffset
        ) as Promise<ParticipatedChannel[]>)
        this.updatePageDetails(channelList,'prev')
        return channelList
    }
}
