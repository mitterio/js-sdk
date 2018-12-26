import { IssuedUserToken } from '@mitter-io/models'
import { TypedAxiosInstance } from 'restyped-axios'
import { MitterApiConfiguration } from '../MitterApiConfiguration'
import { PlatformImplementedFeatures } from '../models/platformImplementedFeatures'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'

const base = `${MitterConstants.Api.VersionPrefix}/users/:userId/tokens`

export const UserTokensPaths = {
    GetMe: `${base}/me`,
    GetUser: `${base}/:userId`,
    GetMyScreenName: `${base}/me/screenname`,
    GetUsersScreenName: `${base}/:userIds/screenname`
}

export interface UserTokensApi {
    '/v1/users/:userId/tokens': {
        POST: {
            params: {
                userId: string
            }

            response: IssuedUserToken
        }
    }
}

export const userTokensClientGenerator = clientGenerator<UserTokensApi>()

export class UserTokensClient {
    private userTokensAxiosClient: TypedAxiosInstance<UserTokensApi>

    constructor(
        private mitterApiConfiguration: MitterApiConfiguration,
        private platformImplementedFeatures: PlatformImplementedFeatures
    ) {
        this.userTokensAxiosClient = userTokensClientGenerator(mitterApiConfiguration)
    }

    getUserToken(userId: string): Promise<IssuedUserToken> {
        return this.userTokensAxiosClient
            .post<'/v1/users/:userId/tokens'>(`/v1/users/${userId}/tokens`)
            .then(x => x.data)
    }
}
