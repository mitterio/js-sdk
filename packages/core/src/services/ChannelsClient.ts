import { TypedAxiosInstance } from 'restyped-axios'
import { MitterApiConfiguration } from '../MitterApiConfiguration'
import { Identifiable } from '../models/base-types'
import { PlatformImplementedFeatures } from '../models/platformImplementedFeatures'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'
import {
    ParticipatedChannel,
    Channel,
    ChannelParticipation,
    EntityProfileAttribute,
    AttributeDef,
    EntityProfile
} from '@mitter-io/models'
import ChannelPaginationManager from '../utils/pagination/ChannelPaginationManager'
import { MAX_CHANNEL_LIST_LENGTH } from '../constants'

const base = `${MitterConstants.Api.VersionPrefix}/channels`

export const ChannelsPaths = {
    GetParticipatedChannelsForMe: `${MitterConstants.Api.VersionPrefix}/users/me/channels`,
    GetParticipatedChannels: `${MitterConstants.Api.VersionPrefix}/users/:userId/channels`,
    GetChannels: `${base}`,
    GetChannelsById: `${base}/:channelId`
}

export interface ChannelsApi {
    '/v1/users/me/channels': {
        GET: {
            response: ParticipatedChannel[]
        }
        query: {
            after?: string
            before?: string
            limit?: number
        }
    }

    '/v1/users/:userId/channels': {
        GET: {
            response: ParticipatedChannel[]
        }
    }

    '/v1/channels/:channelId': {
        GET: {
            params: {
                channelId: string
            }
            response: Channel
        }

        DELETE: {
            params: {
                channelId: string
            }
            response: {}
        }
    }

    '/v1/channels': {
        GET: {
            response: Channel[]
        }

        POST: {
            response: Identifiable<string> | Channel
            body: Channel
        }
    }

    '/v1/channels/:channelId/participants': {
        GET: {
            params: {
                channelId: string
            }
            response: ChannelParticipation[]
        }
        POST: {
            params: {
                channelId: string
            }
            response: {}
        }
    }

    '/v1/channels/:channelId/participants/:participantId': {
        DELETE: {
            params: {
                channelId: string
                participantId: string
            }
            response: {}
        }
    }

    '/v1/channels/:channelId/messages': {
        DELETE: {
            params: {
                channelId: string
            }
            response: {}
        }
    }

    '/v1/channels/:channelId/profile': {
        GET: {
            params: {
                channelId: string
            }
            response: EntityProfile
        }
    }

    '/v1/channels/:channelId/profile/:key': {
        POST: {
            params: {
                channelId: string
                key: string
            }
            body: EntityProfileAttribute
            response: void
        }
    }

    '/v1/channels/:channelId/profile/:keys': {
        GET: {
            params: {
                channelId: string
                key: string
            }
            response: EntityProfileAttribute[]
        }
    }

    '/v1/channels/attribute-def/channels': {
        GET: {
            params: {
                channelId: string
                key: string
            }

            response: AttributeDef[]
        }
        POST: {
            body: AttributeDef
            response: void
        }
    }

    '/v1/channels/attribute-def/channels/:key': {
        GET: {
            params: {
                key: string
            }

            response: AttributeDef
        }
    }
}

export const channelsClientGenerator = clientGenerator<ChannelsApi>()

export class ChannelsClient {
    private channelsAxiosClient: TypedAxiosInstance<ChannelsApi>

    constructor(
        private mitterApiConfiguration: MitterApiConfiguration,
        private platformImplementedFeatures: PlatformImplementedFeatures
    ) {
        this.channelsAxiosClient = channelsClientGenerator(mitterApiConfiguration)
    }

    /***
     *
     * @param {Channel} channel - Channel Object . The shape of the channel object
     * can be found in our tsdocs section  under @mitter-io/models.
     * More details on channels can be found in our docs under the Channels section
     *
     * @returns {Promise<Identifiable<string> | Channel>}
     *
     */
    public newChannel(channel: Channel): Promise<Identifiable<string> | Channel> {
        return this.channelsAxiosClient
            .post<'/v1/channels'>('/v1/channels', channel)
            .then(x => x.data)
    }

    /***
     *
     * @param {string | undefined} before - Fetch all channels that were created before
     * this channel id. The returned list is sorted in a descending order (newest first).
     *
     * @param {string | undefined} after - Fetch all channels that were created after
     * this channel id. The returned list is sorted in an ascending order (oldest first)
     *
     * @param {number} limit - The maximum number of channels to be returned in this query.
     * Please refer to limits for the maximum allowed value on this parameter
     *
     * @returns {Promise<Channel[]>} - Returns a Promisified list of channels filtered by the
     * query params
     */

    public getPaginatedChannelsManager(
        limit: number = MAX_CHANNEL_LIST_LENGTH
    ): ChannelPaginationManager {
        if (limit > MAX_CHANNEL_LIST_LENGTH) {
            limit = MAX_CHANNEL_LIST_LENGTH
        }
        return new ChannelPaginationManager(limit, this)
    }

    public getAllChannels(
        before: string | undefined = undefined,
        after: string | undefined = undefined,
        limit: number = MAX_CHANNEL_LIST_LENGTH
    ): Promise<Channel[]> {
        if (limit > MAX_CHANNEL_LIST_LENGTH) {
            limit = MAX_CHANNEL_LIST_LENGTH
        }
        return this.channelsAxiosClient
            .get<'/v1/channels'>('/v1/channels', {
                params: Object.assign(
                    {},
                    after !== undefined ? { after } : {},
                    before !== undefined ? { before } : {},
                    limit !== undefined ? { limit } : {}
                )
            })
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId -  The  unique identifier of the channel to query for
     *
     * @returns {Promise<Channel>} - Returns a promisified channel object
     * The shape of the channel object can be found in our tsdocs section
     * under @mitter-io/models.
     * More details on channels can be found in our docs under the Channels section
     */

    public getChannel(channelId: string): Promise<Channel> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId'>(`/v1/channels/${channelId}`)
            .then(x => x.data)
    }

    /***
     *
     * @returns {Promise<ParticipatedChannel[]>} - Promisified list of channels in which the
     * user is a participant of .
     */
    public participatedChannels(): Promise<ParticipatedChannel[]> {
        return this.channelsAxiosClient
            .get<'/v1/users/me/channels'>('/v1/users/me/channels')
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier of the channel to be deleted
     *
     * @returns {Promise<{}>}
     */

    public deleteChannel(channelId: string): Promise<{}> {
        return this.channelsAxiosClient
            .delete<'/v1/channels/:channelId'>(`/v1/channels/${channelId}`)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier of the querying channel
     *
     * @returns {Promise<ChannelParticipation[]>} - Promisified list of participants
     * The shape of the channel Participation object can be found in our tsdocs section
     * under @mitter-io/models.
     * More details on participants can be found in our docs under the Channels section
     */
    public getChannelParticipants(
        channelId: string,
        expandParticipants: boolean | undefined = undefined,
        withParticipantsProfileAttributes: string | undefined = undefined
    ): Promise<ChannelParticipation[]> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId/participants'>(`/v1/channels/${channelId}/participants`, {
                params: Object.assign({},
                    expandParticipants !== undefined ? { expandParticipants } : {},
                    withParticipantsProfileAttributes !== undefined ? { withParticipantsProfileAttributes } : {}
                )
            })
            .then(x => x.data)
    }

    /**
     *
     * @param {string} channelId - The  unique identifier  of the  channel to which participants
     * have to be added
     *
     * @param {ChannelParticipation} channelParticipation - Channel Participation Object
     * The shape of the channel Participation object can be found in our tsdocs section
     * under @mitter-io/models.
     * More details on participants can be found in our docs under the Channels section
     *
     * @returns {Promise<{}>}
     */
    public addParticipantToChannel(
        channelId: string,
        channelParticipation: ChannelParticipation
    ): Promise<{}> {
        return this.channelsAxiosClient
            .post<'/v1/channels/:channelId/participants'>(
                `/v1/channels/${channelId}/participants`,
                channelParticipation
            )
            .then(x => x.data)
    }

    /**
     *
     * @param {string} channelId - The  unique identifier  of the channel from which a particular
     * participant has to be removed
     *
     * @param {string} participantId - The  unique identifier  of the participant to be removed
     *
     * @returns {Promise<{}>}
     */

    public deleteParticipantFromChannel(channelId: string, participantId: string): Promise<{}> {
        return this.channelsAxiosClient
            .delete<'/v1/channels/:channelId/participants/:participantId'>(
                `/v1/channels/${channelId}/participants/${participantId}`
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier  of the channel from which all
     * messages are to be deleted
     *
     * @returns {Promise<{}>}
     */
    public deleteAllMessages(channelId: string): Promise<{}> {
        return this.channelsAxiosClient
            .delete<'/v1/channels/:channelId/messages'>(`v1/channels/${channelId}/messages`)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier  of the channel from which all
     * messages are to be deleted
     * @returns {Promise<EntityProfile>} Entity Profile Object
     * The shape of the Entity Profile object can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getChannelsEntityProfile(channelId: string): Promise<EntityProfile> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId/profile'>(`/v1/channels/${channelId}/profile`)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier  of the channel from which all messages are to be deleted
     * @param {string} key- unique key fir the entity profile attribute
     * @param {EntityProfileAttribute} attribute - The Entity profile attribute against the
     * give key
     * The shape of Entity Profile attribute can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<void>}
     */

    addAttributeToChannelProfile(
        channelId: string,
        key: string,
        attribute: EntityProfileAttribute
    ): Promise<void> {
        return this.channelsAxiosClient
            .post<'/v1/channels/:channelId/profile/:key'>(
                `/v1/channels/${channelId}/profile/${key}`,
                attribute
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier  of the channel from which all
     * messages are to be deleted
     * @param {string} keys - comma separated keys against which entity profile attributes are
     * queried
     * @returns {Promise<EntityProfileAttribute[]>} - List of searched entity profile attributes
     * The shape of Entity Profile attribute can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getChannelProfileAttributes(
        channelId: string,
        keys: string
    ): Promise<EntityProfileAttribute[]> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId/profile/:keys'>(
                `/v1/channels/${channelId}/profile/${keys}`
            )
            .then(x => x.data)
    }

    /***
     *  Get all attribute definitions set for channels
     * @returns {Promise<AttributeDef[]>}
     * The shape of Attribute Definition object can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getAttributeDefs(): Promise<AttributeDef[]> {
        return this.channelsAxiosClient
            .get<'/v1/channels/attribute-def/channels'>(`/v1/channels/attribute-def/channels`)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} key - key to get a particular attribute definition for channels
     * @returns {Promise<AttributeDef>}
     * The shape of Attribute Definition object can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getAttributeDef(key: string): Promise<AttributeDef> {
        return this.channelsAxiosClient
            .get<'/v1/channels/attribute-def/channels/:key'>(
                `/v1/channels/attribute-def/channels/${key}`
            )
            .then(x => x.data)
    }

    /***
     * @param {AttributeDef} attributeDef -  Add a attribute definition for channels
     * The shape of Attribute Definition object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<void>}
     */

    addAttributeDef(attributeDef: AttributeDef): Promise<void> {
        return this.channelsAxiosClient
            .post<'/v1/channels/attribute-def/channels'>(
                `/v1/channels/attribute-def/channels`,
                attributeDef
            )
            .then(x => x.data)
    }
}
