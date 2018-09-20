import { TypedAxiosInstance } from 'restyped-axios'
import { Identifiable } from '../models/base-types'
import { clientGenerator } from './common'
import { MitterAxiosInterceptionHost } from '../Mitter'
import { MitterConstants } from './constants'
import { ParticipatedChannel, Channel } from '@mitter-io/models'

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
    }

    '/v1/channels': {
        GET: {
            response: Channel[]
        }

        POST: {
            response: Identifiable<string>
            body: Channel
        }
    }
}

export const channelsClientGenerator = clientGenerator<ChannelsApi>()

export class ChannelsClient {
    private channelsAxiosClient: TypedAxiosInstance<ChannelsApi>

    constructor(private mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) {
        this.channelsAxiosClient = channelsClientGenerator(mitterAxiosInterceptionHost)
    }

    public newChannel(channel: Channel): Promise<Identifiable<string>> {
        return this.channelsAxiosClient
            .post<'/v1/channels'>('/v1/channels', channel)
            .then(x => x.data)
    }
}
