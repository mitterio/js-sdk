import { MitterConstants } from './constants'
import { User } from 'mitter-models'

const base = `${MitterConstants.Api.VersionPrefix}/users`

export type GetUser = {
    user: User
}

export const UsersPaths = {
    GetMe: `${base}/me`,
    GetUser: `${base}/:userId`,
    GetMyScreenName: `${base}/me/screenname`,
    GetUsersScreenName: `${base}/:userIds/screenname`
}

export interface UsersApi {
    '/v1/users/me': {
        GET: {
            response: GetUser
        }
    }

    '/v1/users/:userId': {
        GET: {
            params: {
                userId: string
            }

            response: GetUser
        }
    }
}
