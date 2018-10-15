import { DeliveryEndpoint, User, UserLocator } from '@mitter-io/models'
import { Presence } from '@mitter-io/models/dist/types/user/Presence'
import { TypedAxiosInstance } from 'restyped-axios'
import { MitterAxiosInterceptionHost } from '../Mitter'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'

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
        GET: {
            params: {
                sandboxed: boolean
            }
            response: User[]
        }
        POST: {
            response: {
                identifier: string
            }

            body: User
        }
    }

    '/v1/users/:userId/presence': {
        GET: {
            response: Presence
        }
        POST: {
            body: Presence
            response: {}
        }
    }

    '/v1/users/:userId/locators': {
        POST: {
            body: UserLocator
        }
    }

    '/v1/users/me/tokens': {
        GET: {
            response: void
        }
    }

    '/v1/users/me/delivery-endpoints': {
        POST: {
            body: DeliveryEndpoint
            response: DeliveryEndpoint
        }
        DELETE: {
            body: DeliveryEndpoint['serializedEndpoint']
            response: void
        }
    }
}

export const usersClientGenerator = clientGenerator<UsersApi>()

export class UsersClient {
    private usersAxiosClient: TypedAxiosInstance<UsersApi>

    constructor(private mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) {
        this.usersAxiosClient = usersClientGenerator(mitterAxiosInterceptionHost)
    }

    createUser(user: User): Promise<{ identifier: string }> {
        return this.usersAxiosClient.post<'/v1/users'>('/v1/users', user).then(x => x.data)
    }

    getUsers(locators: string[] | undefined = undefined): Promise<User[]> {
        return this.usersAxiosClient
            .get<'/v1/users'>('/v1/users', {
                params: Object.assign(
                    {},
                    locators === undefined ? { sandboxed: true } : {},
                    locators !== undefined ? { locators } : {}
                )
            })
            .then(x => x.data)
    }

    getUser(userId: string): Promise<User> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId'>(`/v1/users/${userId}`)
            .then(x => x.data)
    }

    setUserPresence(userId: string, userPresence: Presence): Promise<{}> {
        return this.usersAxiosClient
            .post<'/v1/users/:userId/presence'>(`/v1/users/${userId}/presence`, userPresence)
            .then(x => x.data)
    }

    getUserPresence(userId: string): Promise<Presence> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId/presence'>(`/v1/users/${userId}/presence`)
            .then(x => x.data)
    }

    addUserLocator(userId: string, locator: UserLocator) {
        return this.usersAxiosClient
            .post<'/v1/users/:userId/locators'>(`/v1/users/${userId}/locators`, locator)
            .then(x => x.data)
    }

    logout(): Promise<void> {
        return this.usersAxiosClient
            .get<'/v1/users/me/tokens'>(`/v1/users/me/logout`)
            .then(x => x.data)
    }

    addUserDeliveryEndpoint(deliveryEndpoint: DeliveryEndpoint): Promise<DeliveryEndpoint> {
        return this.usersAxiosClient
            .post<'/v1/users/me/delivery-endpoints'>(
                `/v1/users/me/delivery-endpoints`,
                deliveryEndpoint
            )
            .then(x => x.data)
    }

    deleteUserDeliveryEndpoint(
        serializedEndpoint: DeliveryEndpoint['serializedEndpoint']
    ): Promise<void> {
        return this.usersAxiosClient
            .delete<'/v1/users/me/delivery-endpoints'>(
                `/v1/users/me/delivery-endpoints/${serializedEndpoint}`
            )
            .then(x => x.data)
    }
}
