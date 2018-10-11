import { TypedAxiosInstance } from 'restyped-axios'
import { Identifiable } from '../models/base-types'
import { clientGenerator } from './common'
import { MitterAxiosInterceptionHost } from '../Mitter'
import { MitterConstants } from './constants'
import { ParticipatedChannel, Channel, ChannelParticipation } from '@mitter-io/models'

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
}

export const channelsClientGenerator = clientGenerator<ChannelsApi>()

export class ChannelsClient {
    private channelsAxiosClient: TypedAxiosInstance<ChannelsApi>

    constructor(private mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) {
        this.channelsAxiosClient = channelsClientGenerator(mitterAxiosInterceptionHost)
    }

    public newChannel(channel: Channel): Promise<Identifiable<string> | Channel> {
        return this.channelsAxiosClient
            .post<'/v1/channels'>('/v1/channels', channel)
            .then(x => x.data)
    }

    public getAllChannels(
        before: string | undefined = undefined,
        after: string | undefined = undefined,
        limit: number = 45
    ): Promise<Channel[]> {
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

    public getChannel(channelId: string): Promise<Channel> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId'>(`/v1/channels/${channelId}`)
            .then(x => x.data)
    }

    public participatedChannels(): Promise<ParticipatedChannel[]> {
        return this.channelsAxiosClient
            .get<'/v1/users/me/channels'>('/v1/users/me/channels')
            .then(x => x.data)
    }

    public deleteChannel(channelId: string): Promise<{}> {
        return this.channelsAxiosClient
            .delete<'/v1/channels/:channelId'>(`/v1/channels/${channelId}`)
            .then(x => x.data)
    }

    public getChannelParticipants(channelId: string): Promise<ChannelParticipation[]> {
        return this.channelsAxiosClient
            .get<'/v1/channels/:channelId/participants'>(`/v1/channels/${channelId}/participants`)
            .then(x => x.data)
    }

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

    public deleteParticipantFromChannel(channelId: string, participantId: string): Promise<{}> {
        return this.channelsAxiosClient
            .delete<'/v1/channels/:channelId/participants/:participantId'>(
                `/v1/channels/${channelId}/participants/${participantId}`
            )
            .then(x => x.data)
    }

    public deleteAllMessages(channelId: string): Promise<{}> {
        return this.channelsAxiosClient
            .delete<'/v1/channels/:channelId/messages'>(`v1/channels/${channelId}/messages`)
            .then(x => x.data)
    }
}
