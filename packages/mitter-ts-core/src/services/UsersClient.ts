import {
    AttributeDef,
    DeliveryEndpoint,
    EntityProfile,
    EntityProfileAttribute,
    User,
    UserLocator
} from '@mitter-io/models'
import { Presence } from '@mitter-io/models/dist/types/user/Presence'
import { TypedAxiosInstance } from 'restyped-axios'
import { MitterApiConfiguration } from '../MitterApiConfiguration'
import { PlatformImplementedFeatures } from '../models/platformImplementedFeatures'
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
            query: {
                sandboxed?: boolean | undefined
                locators?: string[] | undefined
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
            response: {}
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
    }
    '/v1/users/me/delivery-endpoints/:serializedEndpoint': {
        GET: {
            params: {
                serializedEndpoint: string
            }
            response: DeliveryEndpoint
        }
        DELETE: {
            params: {
                serializedEndpoint: string
            }
            body: DeliveryEndpoint['serializedEndpoint']
            response: void
        }
    }

    '/v1/users/:userId/profile': {
        GET: {
            params: {
                userId: string
            }
            response: EntityProfile
        }
    }

    '/v1/users/:userId/profile/:key': {
        POST: {
            params: {
                userId: string
                key: string
            }
            body: EntityProfileAttribute
            response: void
        }
    }

    '/v1/users/:userId/profile/:keys': {
        GET: {
            params: {
                userId: string
                key: string
            }
        }

        response: EntityProfileAttribute[]
    }

    '/v1/users/attribute-def/users': {
        GET: {
            params: {
                userId: string
                key: string
            }

            response: AttributeDef[]
        }
        POST: {
            body: AttributeDef
            response: void
        }
    }

    '/v1/users/attribute-def/users/:key': {
        GET: {
            params: {
                key: string
            }

            response: AttributeDef
        }
    }
}

export const usersClientGenerator = clientGenerator<UsersApi>()

export class UsersClient {
    private usersAxiosClient: TypedAxiosInstance<UsersApi>

    constructor(
        private mitterApiConfiguration: MitterApiConfiguration,
        private platformImplementedFeatures: PlatformImplementedFeatures
    ) {
        this.usersAxiosClient = usersClientGenerator(mitterApiConfiguration)
    }

    /***
     *
     * @param {User} user -  User Object. The shape of the user object
     * can be found in our tsdocs section  under @mitter-io/models.
     * More details on users can be found in our docs under the Users section
     *
     * @returns {Promise<{identifier: string}>}
     */
    createUser(user: User): Promise<{ identifier: string }> {
        return this.usersAxiosClient.post<'/v1/users'>('/v1/users', user).then(x => x.data)
    }

    /***
     *
     * @param {string[] | undefined} locators - User locators can be email Id or phone no. or both
     *
     * @returns {Promise<User[]>} -  Returns a promisified list of  users filtered by the locators
     * If no locators are given it will return the entire list
     */
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

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     *
     * @returns {Promise<User>} - Returns a promisified user object
     */
    getUser(userId: string): Promise<User> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId'>(`/v1/users/${userId}`)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     *
     * @param {Presence} userPresence -  The user presence object. The shape of the user
     * presence object can be found in our tsdocs section  under @mitter-io/models.
     * More details on user presence can be found in our docs under the Users section
     *
     * @returns {Promise<{}>}
     */
    setUserPresence(userId: string, userPresence: Presence): Promise<{}> {
        return this.usersAxiosClient
            .post<'/v1/users/:userId/presence'>(`/v1/users/${userId}/presence`, userPresence)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     *
     * @returns {Promise<Presence>} - Returns a user presence object. The shape of the user
     * presence object can be found in our tsdocs section  under @mitter-io/models.
     * More details on user presence can be found in our docs under the Users section
     */
    getUserPresence(userId: string): Promise<Presence> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId/presence'>(`/v1/users/${userId}/presence`)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     *
     * @param {UserLocator} locator -  The user locator for the particular user. The shape of
     * the user locator object can be found in our tsdocs section  under @mitter-io/models
     * More details on user locators can be found in our docs under the Users section
     *
     * @returns {Promise<{}>}
     */
    addUserLocator(userId: string, locator: UserLocator): Promise<{}> {
        return this.usersAxiosClient
            .post<'/v1/users/:userId/locators'>(`/v1/users/${userId}/locators`, locator)
            .then(x => x.data)
    }

    /***
     *  Revokes associated user tokens
     * @returns {Promise<void>}
     */
    logout(): Promise<void> {
        return this.usersAxiosClient
            .get<'/v1/users/me/tokens'>(`/v1/users/me/logout`)
            .then(x => x.data)
    }

    /***
     *
     * @param {DeliveryEndpoint} deliveryEndpoint - The delivery endpoint for the particular
     * user. The shape of the delivery endpoint object can be found in our tsdocs section
     * under @mitter-io/models.
     * More details on user delivery points can be found in our docs under the Users section
     *
     * @returns {Promise<DeliveryEndpoint>} - Returns a promisified delivery endpoint
     */
    addUserDeliveryEndpoint(deliveryEndpoint: DeliveryEndpoint): Promise<DeliveryEndpoint> {
        return this.usersAxiosClient
            .post<'/v1/users/me/delivery-endpoints'>(
                `/v1/users/me/delivery-endpoints`,
                deliveryEndpoint
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} serializedEndpoint - serialized delivery endpoint for the user
     * @returns {Promise<DeliveryEndpoint>} - Delivery Endpoint
     */
    getUserDeliveryEndpoint(serializedEndpoint: string): Promise<DeliveryEndpoint> {
        return this.usersAxiosClient
            .get<'/v1/users/me/delivery-endpoints/:serializedEndpoint'>(
                `/v1/users/me/delivery-endpoints/${serializedEndpoint}`
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} serializedEndpoint - Deletes the particular delivery endpoint for a user
     *
     * @returns {Promise<void>}
     */
    deleteUserDeliveryEndpoint(
        serializedEndpoint: DeliveryEndpoint['serializedEndpoint']
    ): Promise<void> {
        return this.usersAxiosClient
            .delete<'/v1/users/me/delivery-endpoints/:serializedEndpoint'>(
                `/v1/users/me/delivery-endpoints/${serializedEndpoint}`
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     * @returns {Promise<EntityProfile>} Entity Profile Object
     * The shape of the Entity Profile object can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getUserEntityProfile(userId: string): Promise<EntityProfile> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId/profile'>(`/v1/users/${userId}/profile`)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     * @param {string} key- unique key fir the entity profile attribute
     * @param {EntityProfileAttribute} attribute - The Entity profile attribute against the
     * give key
     * The shape of Entity Profile attribute can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<void>}
     */

    addAttributeToUserProfile(
        userId: string,
        key: string,
        attribute: EntityProfileAttribute
    ): Promise<void> {
        return this.usersAxiosClient
            .post<'/v1/users/:userId/profile/:key'>(`/v1/users/${userId}/profile/${key}`, attribute)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     * @param {string} keys
     * @param {string} keys - comma separated keys against which entity profile attributes are
     * queried
     * @returns {Promise<EntityProfileAttribute[]>} - List of searched entity profile attributes
     * The shape of Entity Profile attribute can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getUserProfileAttributes(userId: string, keys: string): Promise<EntityProfileAttribute[]> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId/profile/:keys'>(`/v1/users/${userId}/profile/${keys}`)
            .then(x => x.data)
    }

    /***
     *  Get all attribute definitions set for users
     * @returns {Promise<AttributeDef[]>}
     * The shape of Attribute Definition object can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getAttributeDefs(): Promise<AttributeDef[]> {
        return this.usersAxiosClient
            .get<'/v1/users/attribute-def/users'>(`/v1/users/attribute-def/users`)
            .then(x => x.data)
    }

    /***
     * @param {string} key - key to get a particular attribute definition for users
     * @returns {Promise<AttributeDef>}
     * The shape of Attribute Definition object can be found in our tsdocs section
     * under @mitter-io/models.
     */

    getAttributeDef(key: string): Promise<AttributeDef> {
        return this.usersAxiosClient
            .get<'/v1/users/attribute-def/users/:key'>(`/v1/users/attribute-def/users/${key}`)
            .then(x => x.data)
    }

    /***
     * @param {AttributeDef} attributeDef -  Add a attribute definition for users
     * The shape of Attribute Definition object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<void>}
     */

    addAttributeDef(attributeDef: AttributeDef): Promise<void> {
        return this.usersAxiosClient
            .post<'/v1/users/attribute-def/users'>(`/v1/users/attribute-def/users`, attributeDef)
            .then(x => x.data)
    }
}
