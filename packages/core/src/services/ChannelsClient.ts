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
    EntityProfile,
    AttachedEntityMetadata,
    EntityMetadata
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

    '/v1/attribute-def/channels': {
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

    '/v1/attribute-def/channels/:key': {
        GET: {
            params: {
                key: string
            }

            response: AttributeDef
        }
    }

    '/v1/channels/:entityId/metadata': {
        POST: {
            params: {
                entityId: string
            }
            body: EntityMetadata
            response: void
        }
    },
    '/v1/channels/:entityId/metadata/:key': {
        GET: {
            params: {
                entityId: string
                key: string
            }

            response: AttachedEntityMetadata
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


    /**
     *
     * @param {number} limit - number of channels to be fetched
     * @returns {ChannelListPaginationManager} - returns a pagination manager for channels
     */
    public getPaginatedChannelsManager(
        limit: number = MAX_CHANNEL_LIST_LENGTH
    ): ChannelPaginationManager {
        if (limit > MAX_CHANNEL_LIST_LENGTH) {
            limit = MAX_CHANNEL_LIST_LENGTH
        }
        return new ChannelPaginationManager(limit, this)
    }

    /***
     * @param {string | undefined} before - Fetch all channels that were created before
     * this channel id. The returned list is sorted in a descending order (newest first).
     *
     * @param {string | undefined} after - Fetch all channels that were created after
     * this channel id. The returned list is sorted in an ascending order (oldest first)
     *
     * @param {number} limit  - The maximum number of channels to be returned in this query.
     * Please refer to limits for the maximum allowed value on this parameter
     *
     * @param {boolean} shouldFetchMetadata - To fetch the metadata of the channel
     * @param {string} withProfileAttributes - fetch profile attributes of the channel
     * @returns {Promise<Channel[]>}  - Returns a Promisified list of channels filtered by the
     * query params
     */

    public getAllChannels(
        before: string | undefined = undefined,
        after: string | undefined = undefined,
        limit: number = MAX_CHANNEL_LIST_LENGTH,
        shouldFetchMetadata: boolean = false,
        withProfileAttributes?: string
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
                    limit !== undefined ? { limit } : {},
                    {shouldFetchMetadata: shouldFetchMetadata},
                    withProfileAttributes === undefined ? {}: {withProfileAttributes: withProfileAttributes}
                )
            })
            .then(x => x.data)
    }


    /***
     * @param {string} channelId - The  unique identifier of the channel to query for
     * @param {boolean} shouldFetchMetadata - To fetch the metadata of the channel
     * @returns {Promise<Channel>} - Returns a promisified channel object
     * The shape of the channel object can be found in our tsdocs section
     * under @mitter-io/models.
     * More details on channels can be found in our docs under the Channels section
     */
    public getChannel(channelId: string, shouldFetchMetadata: boolean = false,): Promise<Channel> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId'>(`/v1/channels/${channelId}`,{
                params: {
                    shouldFetchMetadata: shouldFetchMetadata,
                }
            })
            .then(x => x.data)
    }

    /***
     * @param {boolean} shouldFetchMetadata - To fetch the metadata of the channels
     * @returns {Promise<ParticipatedChannel[]>} - Promisified list of channels in which the
     * user is a participant of .
     */
    public participatedChannels(shouldFetchMetadata: boolean = false,): Promise<ParticipatedChannel[]> {
        return this.channelsAxiosClient
            .get<'/v1/users/me/channels'>('/v1/users/me/channels', {
                params: {
                    shouldFetchMetadata: shouldFetchMetadata,
                }
            })
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
     * @param {string} channelId - The  unique identifier of the querying channel
     * @param {boolean} expandParticipants -  defaults to true . fetches the user data of the participant
     * @param {string | undefined} withParticipantsProfileAttributes -  fetch with participants profile attributes
     * @param {boolean} fetchParticipantsMetadata - To fetch the metadata of the participants
     * @returns {Promise<ChannelParticipation[]>} - Promisified list of participants
     * The shape of the channel Participation object can be found in our tsdocs section
     * under @mitter-io/models.
     * More details on participants can be found in our docs under the Channels section
     */
    public getChannelParticipants(
        channelId: string,
        expandParticipants: boolean = true,
        withParticipantsProfileAttributes: string | undefined = undefined,
        fetchParticipantsMetadata: boolean = false
    ): Promise<ChannelParticipation[]> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId/participants'>(`/v1/channels/${channelId}/participants`, {
                params: Object.assign({},
                    { expandParticipants: expandParticipants },
                    withParticipantsProfileAttributes !== undefined ? { withParticipantsProfileAttributes } : {},
                    { fetchParticipantsMetadata: fetchParticipantsMetadata}
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
            .get<'/v1/attribute-def/channels'>(`/v1/attribute-def/channels`)
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
            .get<'/v1/attribute-def/channels/:key'>(
                `/v1/attribute-def/channels/${key}`
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
            .post<'/v1/attribute-def/channels'>(
                `/v1/attribute-def/channels`,
                attributeDef
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier  of the channel
     * @param {EntityMetadata} metadata - Metadata for the channel
     * The shape of Metadata object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<void>}
     */

    addMetadataToChannel(channelId: string, metadata: EntityMetadata):Promise<void> {
        return this.channelsAxiosClient
            .post<'/v1/channels/:entityId/metadata'>(`/v1/channels/${channelId}/metadata`,
                metadata
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} channelId - The  unique identifier  of the channel
     * @param {string} key - key against which the metadata should be fetched
     * The shape of Metadata object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<AttachedEntityMetadata>}
     */

    getMetadataForChannel(channelId: string, key: string):Promise<AttachedEntityMetadata> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:entityId/metadata/:key'>(`/v1/channels/${channelId}/metadata/${key}`)
            .then(x => x.data)
    }
}
