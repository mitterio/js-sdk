import { TypedAxiosInstance } from 'restyped-axios'
import { MitterAxiosInterceptionHost } from '../Mitter'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'
import { ChannelReferencingMessage, Message } from '@mitter-io/models'

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
}

export const messagesClientGenerator = clientGenerator<MessagesApi>()

export class MessagesClient {
    private messagesAxiosClient: TypedAxiosInstance<MessagesApi>

    constructor(private mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) {
        this.messagesAxiosClient = messagesClientGenerator(mitterAxiosInterceptionHost)
    }

    sendMessage(channelId: string, message: Message): Promise<Message> {
        return this.messagesAxiosClient
            .post<'/v1/channels/:channelId/messages'>(
                `/v1/channels/${encodeURIComponent(channelId)}/messages`,
                message
            )
            .then(x => x.data)
    }

    getMessages(
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
}
