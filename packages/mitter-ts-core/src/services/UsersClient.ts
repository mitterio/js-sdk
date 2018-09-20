import { TypedAxiosInstance } from 'restyped-axios'
import { MitterAxiosInterceptionHost } from '../Mitter'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'
import { User } from 'mitter-models'

const base = `${MitterConstants.Api.VersionPrefix}/users`

export const UsersPaths = {
    GetMe: `${base}/me`,
    GetUser: `${base}/:userId`,
    GetMyScreenName: `${base}/me/screenname`,
    GetUsersScreenName: `${base}/:userIds/screenname`
}

export interface UsersApi {
    '/v1/users/me': {
        GET: {
            response: User
        }
    }

    '/v1/users/:userId': {
        GET: {
            params: {
                userId: string
            }

            response: User
        }
    }

    '/v1/users': {
        POST: {
            response: {
                identifier: string
            }

            body: User
        }
    }
}

export const usersClientGenerator = clientGenerator<UsersApi>()

export class UsersClient {
    private usersAxiosClient: TypedAxiosInstance<UsersApi>

    constructor(private mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) {
        this.usersAxiosClient = usersClientGenerator(mitterAxiosInterceptionHost)
    }

    getUser(userId: string): Promise<User> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId'>(`/v1/users/${userId}`)
            .then(x => x.data)
    }

    createUser(user: User): Promise<{ identifier: string }> {
        return this.usersAxiosClient.post<'/v1/users'>('/v1/users', user).then(x => x.data)
    }
}
