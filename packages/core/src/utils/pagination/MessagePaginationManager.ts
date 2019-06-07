import { Pagination } from './PaginationInterface'
import { Channel, ChannelReferencingMessage } from '@mitter-io/models'

export class MessagePaginationManager implements Pagination<ChannelReferencingMessage> {
    before: string | undefined
    after: string | undefined

    constructor(
        private getMessages: (before: string | undefined, after: string | undefined) => Promise<ChannelReferencingMessage[]>
    ) {}

    private updatePageDetails(messageList: ChannelReferencingMessage[], order: 'next' | 'prev') {
        if (messageList.length > 0) {
            if(order === 'prev') {
                this.before = messageList[messageList.length - 1].messageId
                this.after = messageList[0].messageId
            }
            else {
                this.before = messageList[0].messageId
                this.after = messageList[messageList.length - 1].messageId
            }
        }
    }

    async nextPage(): Promise<ChannelReferencingMessage[]> {
        const messageList = await (this.getMessages(
            undefined,
            this.after,
        ) as Promise<ChannelReferencingMessage[]>)
        this.updatePageDetails(messageList, 'next')
        return messageList
    }

    async prevPage(): Promise<ChannelReferencingMessage[]> {
        const messageList = await (this.getMessages(
            this.before,
            undefined,
        ) as Promise<ChannelReferencingMessage[]>)
        this.updatePageDetails(messageList, 'prev')
        return messageList
    }
}
