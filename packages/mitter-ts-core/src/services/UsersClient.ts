import { MitterConstants } from './constants'
import { User } from 'mitter-models'

const base = `${MitterConstants.Api.VersionPrefix}/users`

export const UsersPaths = {
    GetMe: Symbol(`${base}/me`),
    GetUser: `${base}/:userId`,
    GetMyScreenName: `${base}/me/screenname`,
    GetUsersScreenName: `${base}/:userIds/screenname`
}

export interface UsersApi {
    GetMe: {
        GET: {
            response: User
        }
    }

    GetUser: {
        GET: {
            params: {
                userId: string
            }

            response: User
        }
    }
}
