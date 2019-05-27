import {
    AttributeDef,
    DeliveryEndpoint,
    EntityProfile,
    EntityProfileAttribute,
    Presence,
    User,
    UserLocator,
    AttachedEntityMetadata,
    EntityMetadata,
    QueriableMetadata, ImpressedPresence
} from '@mitter-io/models'
import { TypedAxiosInstance } from 'restyped-axios'
import { MitterApiConfiguration } from '../MitterApiConfiguration'
import { PlatformImplementedFeatures } from '../models/platformImplementedFeatures'
import { clientGenerator } from './common'
import { MitterConstants } from './constants'
import queryString from 'query-string'

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
                shouldFetchMetadata?: boolean
                withProfileAttributes?: string
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

    '/v1/attribute-def/users': {
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

    '/v1/attribute-def/users/:key': {
        GET: {
            params: {
                key: string
            }

            response: AttributeDef
        }
    },

    '/v1/users/:entityId/metadata': {
        POST: {
            params: {
                entityId: string
            }
            body: EntityMetadata
            response: void
        }
    },

    '/v1/users/:entityId/metadata/:key': {
        GET: {
            params: {
                entityId: string
                key: string
            }

            response: AttachedEntityMetadata
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
     * @param {boolean} shouldFetchMetadata - To fetch the metadata of the user
     * @param {string} withProfileAttributes - string query to get the profile attributes of the user
     * @param {QueriableMetadata | undefined} - he metadata to query for , the shape of the object
     * can be found in our tsdocs section under @mitter-io/models
     * @returns {Promise<User[]>} - Returns a promisified list of  users filtered by the locators
     * If no locators are given it will return the entire list
     */
    getUsers(locators: string[] | undefined = undefined,
             shouldFetchMetadata: boolean = false,
             withProfileAttributes: string | undefined = undefined,
             metadata: QueriableMetadata | undefined = undefined,
    ): Promise<User[]> {
        return this.usersAxiosClient
            .get<'/v1/users'>('/v1/users', {
                params: Object.assign(
                    {},
                    metadata !== undefined ? { metadata: metadata } : {},
                    locators === undefined ? { sandboxed: false } : {},
                    locators !== undefined ? { locators } : {},
                    { shouldFetchMetadata: shouldFetchMetadata },
                    withProfileAttributes === undefined ? {} : { withProfileAttributes: withProfileAttributes }
                ),
                paramsSerializer: (params) => {
                    params.metadata = JSON.stringify(metadata)
                    return queryString.stringify(params, {encode: true})
                }
            })
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     * @param {boolean} shouldFetchMetadata - To fetch the metadata of the user
     * @param {string} withProfileAttributes - string query to get the profile attributes of the user
     * @returns {Promise<User>} - Returns a promisified user object
     */
    getUser(userId: string, shouldFetchMetadata: boolean = false, withProfileAttributes?: string): Promise<User> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId'>(`/v1/users/${userId}`, {
                params: Object.assign(
                    {},
                    { shouldFetchMetadata: shouldFetchMetadata },
                    withProfileAttributes === undefined ? {} : { withProfileAttributes: withProfileAttributes }
                )
            })
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
     * @param {string} userIds - Comma Separated User Ids for whom the presence should be fetched
     *
     * @returns {Promise<Presence>} - Returns a impressed presence object. The shape of the impressed
     * presence object can be found in our tsdocs section  under @mitter-io/models.
     * More details on user presence can be found in our docs under the Users section
     */
    getUserPresence(userIds: string): Promise<ImpressedPresence> {
        return this.usersAxiosClient
            .get<'/v1/users/:userId/presence'>(`/v1/users/${userIds}/presence`)
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
            .get<'/v1/attribute-def/users'>(`/v1/attribute-def/users`)
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
            .get<'/v1/attribute-def/users/:key'>(`/v1/attribute-def/users/${key}`)
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
            .post<'/v1/attribute-def/users'>(`/v1/attribute-def/users`, attributeDef)
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     * @param {EntityMetadata} metadata - Metadata for the user
     * The shape of Metadata object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<void>}
     */

    addMetadataToUser(userId: string, metadata: EntityMetadata):Promise<void> {
        return this.usersAxiosClient
            .post<'/v1/users/:entityId/metadata'>(`/v1/users/${userId}/metadata`,
                metadata
            )
            .then(x => x.data)
    }

    /***
     *
     * @param {string} userId - The  unique identifier  of the user
     * @param {string} key - key against which the metadata should be fetched
     * The shape of Metadata object can be found in our tsdocs section
     * under @mitter-io/models.
     * @returns {Promise<AttachedEntityMetadata>}
     */

    getMetadataForUser(userId: string, key: string):Promise<AttachedEntityMetadata> {
        return this.usersAxiosClient
            .get<'/v1/users/:entityId/metadata/:key'>(`/v1/users/${userId}/metadata/${key}`)
            .then(x => x.data)
    }
}
