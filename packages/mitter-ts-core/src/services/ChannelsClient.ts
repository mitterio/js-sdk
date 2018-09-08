import { MitterConstants } from './constants'
import { ParticipatedChannel, Channel } from 'mitter-models'

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
    }
}
