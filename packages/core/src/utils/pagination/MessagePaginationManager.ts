import { Pagination } from './PaginationInterface'
import { Channel, ChannelReferencingMessage } from '@mitter-io/models'
import { MessagesClient } from '../../services'

export default class MessagePaginationManager implements Pagination<ChannelReferencingMessage> {
    before: string | undefined
    after: string | undefined

    constructor(
        private getMessages: (before: string | undefined, after: string | undefined) => Promise<ChannelReferencingMessage[]>
    ) {}

    private updatePageDetails(messageList: ChannelReferencingMessage[]) {
        if (messageList.length > 0) {
            this.before = messageList[messageList.length - 1].messageId
            this.after = messageList[0].messageId
        }
    }

    async nextPage(): Promise<ChannelReferencingMessage[]> {
        const messageList = await (this.getMessages(
            undefined,
            this.after,
        ) as Promise<ChannelReferencingMessage[]>)
        this.updatePageDetails(messageList)
        return messageList
    }

    async prevPage(): Promise<ChannelReferencingMessage[]> {
        const messageList = await (this.getMessages(
            this.before,
            undefined,
        ) as Promise<ChannelReferencingMessage[]>)
        this.updatePageDetails(messageList)
        return messageList
    }
}
