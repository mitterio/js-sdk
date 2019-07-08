import { MessagingPipelinePayload, User } from '@mitter-io/models'
import { AxiosInstance } from 'axios'
import { UserAuthorizationInterceptor } from './auth/user-interceptors'
import { MessagingPipelineDriverHost } from './driver-host/MessagingPipelineDriverHost'
import { KvStore, PlatformMitter } from './mitter-core'
import { MitterApiConfiguration } from './MitterApiConfiguration'
import { MitterAxiosApiInterceptor } from './MitterApiGateway'
import { MitterClientSet } from './MitterClientSet'
import { Identifiable } from './models/base-types'
import { PlatformImplementedFeatures } from './models/platformImplementedFeatures'
import MitterUser from './objects/Users'
import { MitterConstants } from './services/constants'
import MessagingPipelineDriver from './specs/MessagingPipelineDriver'
import { statefulPromise } from './utils'

export interface PlatformMitter {
    info?(): string

    version(): string

    platformImplementedFeaturesProvider(): PlatformImplementedFeatures
}

export interface MitterApiConfigurationProvider {
    mitterApiConfigurationProvider(): MitterApiConfiguration
}

export abstract class MitterBase implements PlatformMitter, MitterApiConfigurationProvider {
    clients = (): MitterClientSet => {
        return new MitterClientSet(
            this.mitterApiConfigurationProvider(),
            this.platformImplementedFeaturesProvider()
        )
    }

    abstract mitterApiConfigurationProvider(): MitterApiConfiguration

    abstract platformImplementedFeaturesProvider(): PlatformImplementedFeatures

    version(): string {
        return '0.5.0'
    }
}

export class Mitter extends MitterBase {
    // tslint:disable-next-line:variable-name
    private static readonly StoreKey = {
        UserAuthorizationToken: 'userAuthorizationToken',
        UserId: 'userId'
    }
    private cachedUserAuthorization: string | undefined = undefined
    private cachedUserId: string | undefined = undefined
    private mitterAxiosInterceptor: MitterAxiosApiInterceptor
    private messagingPipelineDriverHost: MessagingPipelineDriverHost
    private subscriptions: ((payload: MessagingPipelinePayload) => void)[] = []
    private onAuthAvailableSubscribers: (() => void)[] = []
    private onPipelinesInitialized = statefulPromise<void>()

    constructor(

        public readonly kvStore: KvStore,
        public readonly applicationId: string | undefined,
        public readonly mitterApiBaseUrl: string = MitterConstants.MitterApiUrl,
        public readonly weaverUrl: string,
        pipelineDrivers: MessagingPipelineDriver[] | MessagingPipelineDriver,
        globalHostObject: any,
        initMessagingPipelineSubscriptions: Array<string>,
        private platformImplementedFeatures: PlatformImplementedFeatures,
        disableXHRCaching: boolean,
        mitterInstanceReady: () => void,
        private onTokenExpireFunctions: (() => void)[],
        onMessagingPipelineConnectCb: (initSubscription: Array<string>) => void

    ) {
        super()

        this.mitterAxiosInterceptor = new MitterAxiosApiInterceptor(
            /* the application id */
            this.applicationId,

            /* The generic request interceptor to use */
            new UserAuthorizationInterceptor(
                () => this.cachedUserAuthorization,
                this.applicationId
            ).getInterceptor(),

            /* The base url for mitter apis */
            this.mitterApiBaseUrl,
            disableXHRCaching
        )

        this.messagingPipelineDriverHost = new MessagingPipelineDriverHost(
            pipelineDrivers,
            this,
            kvStore,
            initMessagingPipelineSubscriptions,
            onMessagingPipelineConnectCb,
            (e?: any) => {
                if (e !== undefined) {
                    this.onPipelinesInitialized.reject(e)
                } else {
                    this.onPipelinesInitialized.resolve()
                }
            }
        )

        this.messagingPipelineDriverHost.subscribe((messagingPayload: any) =>
            this.subscriptions.forEach(subscription => subscription(messagingPayload))
        )

        globalHostObject._mitter_context = this

    }

    mitterApiConfigurationProvider = () => {
        return new MitterApiConfiguration(
            new UserAuthorizationInterceptor(
                () => this.cachedUserAuthorization,
                this.applicationId
            ).getInterceptor(),
            this.mitterApiBaseUrl,
            this.enableAxiosInterceptor
        )
    }

    enableAxiosInterceptor = (axiosInstance: AxiosInstance) => {
        this.mitterAxiosInterceptor.enable(axiosInstance)
    }

    platformImplementedFeaturesProvider() {
        return this.platformImplementedFeatures
    }

    userAuthorizationAvailable(onAuthAvailable: () => void) {
        this.onAuthAvailableSubscribers.push(onAuthAvailable)
    }

    subscribeToPayload(subscription: (payload: MessagingPipelinePayload) => void) {
        this.subscriptions.push(subscription)
    }

    disableAxiosInterceptor(axiosInstance: AxiosInstance) {
        this.mitterAxiosInterceptor.disable(axiosInstance)
    }

    setUserAuthorization(authorizationToken: string, disableTokenCaching: boolean = false) {
        if (authorizationToken.split('.').length === 3) {
            if (typeof atob !== 'undefined') {
                this.cachedUserId = JSON.parse(atob(authorizationToken.split('.')[1]))['userId']
            } else if (this.platformImplementedFeatures.base64Decoder !== undefined) {
                const base64decoder = this.platformImplementedFeatures.base64Decoder
                this.cachedUserId = JSON.parse(base64decoder(authorizationToken.split('.')[1]))[
                    'userId'
                ]
            }
        }

        if (this.cachedUserAuthorization === authorizationToken) {
            return
        }

        this.cachedUserAuthorization = authorizationToken
        this.announceAuthorizationAvailable()
        if(!disableTokenCaching) {
            this.kvStore
                .setItem(Mitter.StoreKey.UserAuthorizationToken, authorizationToken)
                .catch((err: any) => {
                    throw new Error(`Error storing key ${err}`)
                })
        }
    }

    startMessagingPipelineAnonymously(): void {
        this.messagingPipelineDriverHost.refresh()
    }

    getUserAuthorization(): Promise<string | undefined> {
        if (this.cachedUserAuthorization !== undefined) {
            return Promise.resolve(this.cachedUserAuthorization)
        } else {
            return this.kvStore.getItem(Mitter.StoreKey.UserAuthorizationToken)
        }
    }

    setUserId(userId: string): Promise<void> {
        if (this.cachedUserId === userId) return Promise.resolve()

        return this.kvStore.setItem(Mitter.StoreKey.UserId, userId).catch((err: any) => {
            throw new Error(`Error storing userId ${err}`)
        })
    }

    getUserId(): Promise<string> {
        if (this.cachedUserId !== undefined) {
            return Promise.resolve(this.cachedUserId)
        } else {
            return this.kvStore.getItem<string>(Mitter.StoreKey.UserId).then(userId => {
                if (userId === undefined) {
                    return this._me().userId.then(fetchedUserId => {
                        return this.setUserId(fetchedUserId).then(() => fetchedUserId)
                    })
                } else {
                    return Promise.resolve(userId)
                }
            })
        }
    }

    onPipelinesInit(): Promise<void> {
        return this.onPipelinesInitialized
    }

    // Smart-object values

    me(): Identifiable<User> {
        return {
            identifier: this.cachedUserId!!
        }
    }

    private _me(): MitterUser {
        return new MitterUser(this)
    }

    private executeOnTokenExpireFunctions() {
        this.onTokenExpireFunctions.forEach(onTokenExpire => {
            onTokenExpire()
        })
    }

    private announceAuthorizationAvailable() {
        this.onAuthAvailableSubscribers.forEach(subscriber => subscriber())
    }
}
