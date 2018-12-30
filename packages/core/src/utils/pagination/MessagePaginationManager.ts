import { Pagination } from './PaginationInterface'
import { Channel, ChannelReferencingMessage } from '@mitter-io/models'
import { MessagesClient } from '../../services'

export default class MessagePaginationManager implements Pagination<ChannelReferencingMessage> {
    before: string | undefined
    after: string | undefined

    constructor(
        private channelId: string,
        public limit: number | undefined,
        private messageClient: MessagesClient
    ) {}

    private updatePageDetails(messageList: ChannelReferencingMessage[]) {
        if (messageList.length > 0) {
            this.before = messageList[messageList.length - 1].messageId
            this.after = messageList[0].messageId
        }
    }

    async nextPage(): Promise<ChannelReferencingMessage[]> {
        const messageList = await (this.messageClient.getMessages(
            this.channelId,
            undefined,
            this.after,
            this.limit
        ) as Promise<ChannelReferencingMessage[]>)
        this.updatePageDetails(messageList)
        return messageList
    }

    async prevPage(): Promise<ChannelReferencingMessage[]> {
        const messageList = await (this.messageClient.getMessages(
            this.channelId,
            this.before,
            undefined,
            this.limit
        ) as Promise<ChannelReferencingMessage[]>)
        this.updatePageDetails(messageList)
        return messageList
    }
}
