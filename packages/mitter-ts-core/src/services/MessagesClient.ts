import {
    ChannelReferencingMessage,
    Message,
    MessageTimelineEvent,
    TimelineEvent
} from '@mitter-io/models'
import { TypedAxiosInstance } from 'restyped-axios'
import { MitterAxiosInterceptionHost } from '../Mitter'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'

const base = `${MitterConstants.Api.VersionPrefix}/messages`

export const MessagesPaths = {
    GetMessageById: `${base}/:messageId`,
    GetMessageInChannel: `${MitterConstants.Api.VersionPrefix}/channels/:channelId/messages`,
    PostMessageToChannel: `${MitterConstants.Api.VersionPrefix}/channels/:channelId/messages`
}

export interface MessagesApi {
    '/v1/messages/:messageId': {
        GET: {
            params: {
                messageId: string
            }

            response: Message
        }
    }

    '/v1/channels/:channelId/messages': {
        GET: {
            params: {
                channelId: string
            }

            query: {
                after?: string
                before?: string
                limit?: number
            }

            response: ChannelReferencingMessage[]
        }

        POST: {
            params: {
                channelId: string
            }

            body: Message
        }
    }

    '/v1/channels/:channelId/messages/:messageIds/timeline': {
        GET: {
            params: {
                channelId: string
                messageIds: string
            }
            response: MessageTimelineEvent[]
        }

        POST: {
            params: {
                channelId: string
                messageIds: string
            }
            body: TimelineEvent

            response: {}
        }
    }

    '/v1/channels/:channelId/messages/:messageIds': {
        DELETE: {
            params: {
                channelId: string
                messageIds: string
            }
        }
    }
}

export const messagesClientGenerator = clientGenerator<MessagesApi>()

export class MessagesClient {
    private messagesAxiosClient: TypedAxiosInstance<MessagesApi>

    constructor(private mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) {
        this.messagesAxiosClient = messagesClientGenerator(mitterAxiosInterceptionHost)
    }

    public sendMessage(channelId: string, message: Message): Promise<Message> {
        return this.messagesAxiosClient
            .post<'/v1/channels/:channelId/messages'>(
                `/v1/channels/${encodeURIComponent(channelId)}/messages`,
                message
            )
            .then(x => x.data)
    }

    public getMessage(messageId: string): Promise<Message> {
        return this.messagesAxiosClient
            .get<'/v1/messages/:messageId'>(`/v1/messages/${messageId}`)
            .then(x => x.data)
    }

    public getMessages(
        channelId: string,
        before: string | undefined = undefined,
        after: string | undefined = undefined,
        limit: number = 45
    ): Promise<ChannelReferencingMessage[]> {
        return this.messagesAxiosClient
            .get<'/v1/channels/:channelId/messages'>(`/v1/channels/${channelId}/messages`, {
                params: Object.assign(
                    {},
                    after !== undefined ? { after } : {},
                    before !== undefined ? { before } : {},
                    limit !== undefined ? { limit } : {}
                )
            })
            .then(x => x.data)
    }

    public getMessageTimelineEvent(
        channelId: string,
        messageIds: string
    ): Promise<MessageTimelineEvent[]> {
        return this.messagesAxiosClient
            .get<'/v1/channels/:channelId/messages/:messageIds/timeline'>(
                `/v1/channels/${channelId}/messages/${messageIds}/timeline`
            )
            .then(x => x.data)
    }

    public addMessageTimelineEvent(
        channelId: string,
        messageIds: string,
        timelineEvent: TimelineEvent
    ) {
        return this.messagesAxiosClient
            .post<'/v1/channels/:channelId/messages/:messageIds/timeline'>(
                `/v1/channels/${channelId}/messages/${messageIds}/timeline`,
                timelineEvent
            )
            .then(x => x.data)
    }

    public deleteMessages(channelId: string, messageIds: string): Promise<void> {
        return this.messagesAxiosClient
            .delete<'/v1/channels/:channelId/messages/:messageIds'>(
                `v1/channels/${channelId}/messages/${messageIds}`
            )
            .then(x => x.data)
    }
}
