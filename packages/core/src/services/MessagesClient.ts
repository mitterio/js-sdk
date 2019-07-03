import {
    ChannelReferencingMessage,
    Message,
    MessageTimelineEvent,
    TimelineEvent,
    AttachedEntityMetadata,
    EntityMetadata,
    QueriableMetadata
} from '@mitter-io/models'
import { TypedAxiosInstance } from 'restyped-axios'
import { MitterApiConfiguration } from '../MitterApiConfiguration'
import { PlatformImplementedFeatures } from '../models/platformImplementedFeatures'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'
import {
    MAX_MESSAGE_LIST_LENGTH,
    MULTIPART_MESSAGE_NAME_KEY,
    MULTIPART_MESSAGE_FILE_NAME
} from '../constants'
import { MessagePaginationManager } from '../utils/pagination/MessagePaginationManager'
import queryString from 'query-string'
const base = `${MitterConstants.Api.VersionPrefix}/messages`

export const MessagesPaths = {
    GetMessageById: `${base}/:messageId`,
    GetMessageInChannel: `${MitterConstants.Api.VersionPrefix}/channels/:channelId/messages`,
    PostMessageToChannel: `${MitterConstants.Api.VersionPrefix}/channels/:channelId/messages`
}

export type BaseFileConfig = {
    filename: string
    type: string
}

export interface BlobConfig extends BaseFileConfig {
    file: File
}

export interface UriConfig extends BaseFileConfig {
    uri: string
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

    '/v1/messages': {
        GET: {
            query: {
                shouldFetchMetadata: boolean,
                shouldFetchChannel: boolean,
                metadata: string,
                channelIds: string,
                senderIds: string
            }
            response: ChannelReferencingMessage[]
        }
    }

    '/v1/channels/:channelId/messages': {
        GET: {
            params: {
                channelId: string,
            }

            query: {
                shouldFetchChannel: boolean
                shouldFetchMetadata: boolean
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

            body: Message | FormData
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

    '/v1/messages/:entityId/metadata': {
        POST: {
            params: {
                entityId: string
            }
            body: EntityMetadata
            response: void
        }
    },
    '/v1/messages/:entityId/metadata/:key': {
        GET: {
            params: {
                entityId: string
                key: string
            }

            response: AttachedEntityMetadata
        }
    }
    'v1/counts/:countClass/:subject1/:subject2/:subject3': {
        GET: {
            params: {
                countClass: string,
                subject1: string,
                subject2: string,
                subject3: string
            }
            response: number
        }

    }

}

export const messagesClientGenerator = clientGenerator<MessagesApi>()

export class MessagesClient {
    private messagesAxiosClient: TypedAxiosInstance<MessagesApi>

    constructor(
        private mitterApiConfiguration: MitterApiConfiguration,
        private platformImplementedFeatures: PlatformImplementedFeatures
    ) {
        this.messagesAxiosClient = messagesClientGenerator(mitterApiConfiguration)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier for the channel to which the message
     * has to be sent
     *
     * @param {Message} message - To be sent message object. The shape of the message object
     * can be found in our tsdocs section  under @mitter-io/models.
     *
     * More details on messages can be found in our docs under the Messages section
     * @returns {Promise<Message>} - Returns a promisified Message object
     */
    public sendMessage(channelId: string, message: Message): Promise<Message> {
        return this.messagesAxiosClient
            .post<'/v1/channels/:channelId/messages'>(
                `/v1/channels/${encodeURIComponent(channelId)}/messages`,
                message
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} messageId - The unique identifier for the querying message
     *
     * @returns {Promise<Message>} - Promisified message object.
     * The shape of the message object can be found in our tsdocs section under @mitter-io/models.
     * More details on channels can be found in our docs under the Messages section
     */
    public getMessage(messageId: string): Promise<Message> {
        return this.messagesAxiosClient
            .get<'/v1/messages/:messageId'>(`/v1/messages/${messageId}`)
            .then(x => x.data)
    }

    /***
     *
     * @param {QueriableMetadata} metadata - the metadata to query for , the shape of the object
     * can be found in our tsdocs section under @mitter-io/models
     *
     * @param {string} channelIds - the channelIds against which to query for
     *
     * @param {string} senderIds - the senderIds against which to query for
     *
     * @param {boolean} shouldFetchMetadata - to fetch metadata for the message
     *
     *  @param {string | undefined} before - Fetch all messages that were sent before this
     * message id. The returned list is sorted in a descending order (newest first).
     *
     * @param {string | undefined} after -  Fetch all messages that were sent after this message id.
     * The returned list is sorted in an ascending order (oldest first)
     *
     * @param {number} limit - The maximum number of messages to be returned in this query. Please
     * refer to limits for the maximum allowed value on this parameter
     *
     * @returns {Promise<ChannelReferencingMessage[]>} - Returns a Promisified list of messages
     * filtered by the query params
     */
    public getQueriedMessages(metadata: QueriableMetadata | undefined = undefined,
                              channelIds: string | undefined = undefined,
                              senderIds: string | undefined = undefined,
                              shouldFetchMetadata: boolean = false,
                              shouldFetchChannel: boolean = false,
                              withChannelProfileAttributes: string | undefined = undefined,
                              before: string | undefined = undefined,
                              after: string | undefined = undefined,
                              limit: number = MAX_MESSAGE_LIST_LENGTH
                              ): Promise<ChannelReferencingMessage[]> {


        return this.messagesAxiosClient
            .get<'/v1/messages'>('/v1/messages', {
                params: Object.assign(
                    {},
                    {shouldFetchMetadata: shouldFetchMetadata},
                    {shouldFetchChannel: shouldFetchChannel},
                    withChannelProfileAttributes !== undefined ? { withChannelProfileAttributes } : {},
                    metadata !== undefined ? { metadata: metadata } : {},
                    channelIds !== undefined ? { channelIds } : {},
                    senderIds !== undefined ? { senderIds } : {},
                    after !== undefined ? { after } : {},
                    before !== undefined ? { before } : {},
                    limit !== undefined ? { limit } : {}
                ),
                paramsSerializer: (params) => {
                    params.metadata = JSON.stringify(metadata)
                    return queryString.stringify(params, {encode: true})
                }
            }).then(x => x.data)

    }

    /***
     *
     * @param {QueriableMetadata} metadata - the metadata to query for , the shape of the object
     * can be found in our tsdocs section under @mitter-io/models
     *
     * @param {string} channelIds - the channelIds against which to query for
     *
     * @param {string} senderIds - the senderIds against which to query for
     *
     * @param {boolean} shouldFetchMetadata - to fetch metadata for the message
     *
     * @param {number} limit - The maximum number of messages to be returned in this query. Please
     * refer to limits for the maximum allowed value on this parameter
     *
     * @returns {MessagePaginationManager} - returns a pagination manager for messages for that channel
     */

    public getPaginatedQueriedMessagesManager(
        metadata?: QueriableMetadata,
        channelIds?: string,
        senderIds?: string,
        shouldFetchMetadata: boolean = false,
        shouldFetchChannel: boolean = false,
        withChannelProfileAttributes: string | undefined = undefined,
        limit: number = MAX_MESSAGE_LIST_LENGTH
    ): MessagePaginationManager {
        if (limit > MAX_MESSAGE_LIST_LENGTH) {
            limit = MAX_MESSAGE_LIST_LENGTH
        }
        return new MessagePaginationManager(
            (before: string | undefined, after: string | undefined) =>
            this.getQueriedMessages(metadata, channelIds, senderIds, shouldFetchMetadata, shouldFetchChannel, withChannelProfileAttributes, before, after, limit)
        )
    }

    /***
     *
     * @param {string} channelId - The  unique identifier for the channel from which messages
     * have to be fetched
     * @param {number} limit - number of messages to be fetched
     * @returns {MessagePaginationManager} - returns a pagination manager for messages for that channel
     */
    public getPaginatedMessagesManager(
        channelId: string,
        shouldFetchMetadata: boolean = false,
        shouldFetchChannel: boolean = false,
        withChannelProfileAttributes: string | undefined ,
        limit: number = MAX_MESSAGE_LIST_LENGTH
    ): MessagePaginationManager {
        if (limit > MAX_MESSAGE_LIST_LENGTH) {
            limit = MAX_MESSAGE_LIST_LENGTH
        }
        return new MessagePaginationManager((before: string | undefined, after: string | undefined) => this.getMessages(channelId,shouldFetchMetadata,shouldFetchChannel,withChannelProfileAttributes,before,after,limit))
    }

    /**
     *
     * @param {string} channelId - The  unique identifier for the channel from which messages
     * have to be fetched
     *
     * @param {string | undefined} before - Fetch all messages that were sent before this
     * message id. The returned list is sorted in a descending order (newest first).
     *
     * @param {string | undefined} after -  Fetch all messages that were sent after this message id.
     * The returned list is sorted in an ascending order (oldest first)
     *
     * @param {number} limit - The maximum number of messages to be returned in this query. Please
     * refer to limits for the maximum allowed value on this parameter
     *
     * @returns {Promise<ChannelReferencingMessage[]>} - Returns a Promisified list of messages
     * filtered by the query params
     */

    public getMessages(
        channelId: string,
        shouldFetchMetadata: boolean = false,
        shouldFetchChannel: boolean = false,
        withChannelProfileAttributes: string | undefined = undefined,
        before: string | undefined = undefined,
        after: string | undefined = undefined,
        limit: number = MAX_MESSAGE_LIST_LENGTH
    ): Promise<ChannelReferencingMessage[]> {
        if (limit > MAX_MESSAGE_LIST_LENGTH) {
            limit = MAX_MESSAGE_LIST_LENGTH
        }
        return this.messagesAxiosClient
            .get<'/v1/channels/:channelId/messages'>(`/v1/channels/${channelId}/messages`, {
                params: Object.assign(
                    {},
                    {shouldFetchMetadata: shouldFetchMetadata},
                    {shouldFetchChannel: shouldFetchChannel},
                    withChannelProfileAttributes !== undefined ? { withChannelProfileAttributes } : {},
                    after !== undefined ? { after } : {},
                    before !== undefined ? { before } : {},
                    limit !== undefined ? { limit } : {}
                )
            })
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The unique identifier for the channel which contains the
     * messages specified in the messageIds argument
     *
     * @param {string} messageIds - The unique identifiers of the messages for which timline
     * events have to be fetched, separated by commas
     *
     * @returns {Promise<MessageTimelineEvent[]>} - Promisified list of message timeline events
     * The shape of the message timeline event object can be found in our tsdocs section  under
     * @mitter-io/models.
     * More details on message timeline events can be found in our docs under the Messages section
     */
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

    /**
     *
     * @param {string} channelId - The unique identifier for the channel which contains the
     * messages specified in the messageIds argument
     *
     * @param {string} messageIds - The unique identifiers of the messages for which timline
     * events have to be fetched
     *
     * @param {TimelineEvent} timelineEvent - The timeline event object to be associated with
     * the message
     *
     * The shape of the message timeline event object can be found in our tsdocs section  under
     * @mitter-io/models.
     *
     * More details on message timeline events can be found in our docs under the Messages section
     * @returns {Promise<{}>}
     */
    public addMessageTimelineEvent(
        channelId: string,
        messageId: string,
        timelineEvent: TimelineEvent
    ) {
        return this.messagesAxiosClient
            .post<'/v1/channels/:channelId/messages/:messageIds/timeline'>(
                `/v1/channels/${channelId}/messages/${messageId}/timeline`,
                timelineEvent
            )
            .then(x => x.data)
    }

    /**
     *
     * @param {string} channelId - The unique identifier for the channel from which messages
     * have to be deleted
     *
     * @param {string} messageIds - The unique identifiers of messages to be deleted, separated
     * by commas
     *
     * @returns {Promise<void>}
     */
    public deleteMessages(channelId: string, messageIds: string): Promise<void> {
        return this.messagesAxiosClient
            .delete<'/v1/channels/:channelId/messages/:messageIds'>(
                `v1/channels/${channelId}/messages/${messageIds}`
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The unique identifier for the channel from which messages
     * @param {Message} message -  To be sent message object. The shape of the message object
     * can be found in our tsdocs section  under @mitter-io/models.
     * @param {FileObject<T extends File | string>} fileObject - A File object (this is usually
     * in the case of web) Or  A Uri pointing to the location of the file( this is usually the
     * case of react-native)
     * A File object is recommended to be passed in a web environment and a uri string is
     * recommended to be passed in a react-native environment
     * @returns {Promise<Message>}
     */

    public uploadFile<T extends BlobConfig | UriConfig>(
        channelId: string,
        message: Message,
        fileObject: T
    ): Promise<Message> | Error {
        if (this.platformImplementedFeatures.processMultipartRequest !== undefined) {
            const uploadPath =
                this.mitterApiConfiguration.mitterApiBaseUrl + `/v1/channels/${channelId}/messages`
            const requestParams = { data: undefined, headers: {}, method: 'POST', path: uploadPath }
            this.mitterApiConfiguration.genericInterceptor(requestParams)

            return this.platformImplementedFeatures.processMultipartRequest<T>(
                requestParams,
                channelId,
                message,
                fileObject
            )
        } else {
            const formData = new FormData()
            formData.append(
                fileObject.filename,
                (fileObject as BlobConfig).file,
                fileObject.filename
            )
            const blob = new Blob([JSON.stringify(message, null, 2)], { type: 'application/json' })
            formData.append(MULTIPART_MESSAGE_NAME_KEY, blob, MULTIPART_MESSAGE_FILE_NAME)
            return this.messagesAxiosClient
                .post<'/v1/channels/:channelId/messages'>(
                    `/v1/channels/${encodeURIComponent(channelId)}/messages`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                )
                .then(x => x.data)
        }
    }

    /***
     *
     * @param {string} messageId - The  unique identifier  of the message
     * @param {EntityMetadata} metadata - Metadata for the message
     * The shape of Metadata object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<void>}
     */

    addMetadataToMessage(messageId: string, metadata: EntityMetadata):Promise<void> {
        return this.messagesAxiosClient
            .post<'/v1/messages/:entityId/metadata'>(`/v1/messages/${messageId}/metadata`,
                metadata
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} messageId - The  unique identifier  of the message
     * @param {string} key - key against which the metadata should be fetched
     * The shape of Metadata object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<AttachedEntityMetadata>}
     */

    getMetadataForMessage(messageId: string, key: string): Promise<AttachedEntityMetadata> {
        return this.messagesAxiosClient
            .get<'/v1/messages/:entityId/metadata/:key'>(`/v1/messages/${messageId}/metadata/${key}`)
            .then(x => x.data)
    }

    getCount(countClass: string, subject1?: string, subject2?: string, subject3?: string): Promise<number> {
        let url = `v1/counts/${countClass}`
        const subjects = [subject1, subject2, subject3]
        for(let i = 0; i < subjects.length; i++ ) {
            if(subjects[i]) {
                url += `/${subjects[i]}`
            }
            else {
                break
            }
        }
        return this.messagesAxiosClient
            .get<'v1/counts/:countClass/:subject1/:subject2/:subject3'>(url)
            .then(x => x.data)
    }
}
