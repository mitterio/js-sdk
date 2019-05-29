import { Pagination } from './PaginationInterface'
import {ParticipatedChannel} from "@mitter-io/models";


export class ParticipatedChannelsPaginationManager implements Pagination<ParticipatedChannel> {
    before: string | undefined
    after: string | undefined

    constructor( private getChannelFn: (before: string | undefined, after: string | undefined) => Promise<ParticipatedChannel[]> ) {}

    private updatePageDetails(participatedChannelList: ParticipatedChannel[]) {
        if (participatedChannelList.length > 0) {
            this.before = participatedChannelList[participatedChannelList.length - 1].channel.channelId!
            this.after = participatedChannelList[0].channel.channelId!
        }
    }

    async nextPage(): Promise<ParticipatedChannel[]> {
        const channelList = await (this.getChannelFn(
            undefined,
            this.after,
        ) as Promise<ParticipatedChannel[]>)
        this.updatePageDetails(channelList)
        return channelList
    }

    async prevPage(): Promise<ParticipatedChannel[]> {
        const channelList = await (this.getChannelFn(
            this.before,
            undefined,
        ) as Promise<ParticipatedChannel[]>)
        this.updatePageDetails(channelList)
        return channelList
    }
}
