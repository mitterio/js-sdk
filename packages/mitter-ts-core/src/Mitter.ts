import { KvStore } from './mitter-core'
import { MitterAxiosApiInterceptor } from './MitterApiGateway'
import MessagingPipelineDriver from './specs/MessagingPipelineDriver'
import { MessagingPipelineDriverHost } from './driver-host/MessagingPipelineDriverHost'
import { MessagingPipelinePayload } from 'mitter-models'
import { MitterConstants } from './services/constants'
import { UserAuthorizationInterceptor } from './auth/user-interceptors'
import MitterUser from './objects/Users'

import { AxiosInstance } from 'axios'
import { statefulPromise } from './utils'

export class Mitter {
    // tslint:disable-next-line:variable-name
    private static readonly StoreKey = {
        UserAuthorizationToken: 'userAuthorizationToken',
        UserId: 'userId'
    }
    private cachedUserAuthorization: string | undefined = undefined
    private cachedUserId: string | undefined = undefined

    private mitterAxiosInterceptor: MitterAxiosApiInterceptor = new MitterAxiosApiInterceptor(
        this,
        this.applicationId,
        () => this.executeOnTokenExpireFunctions,
        new UserAuthorizationInterceptor(
            () => this.cachedUserAuthorization,
            this.applicationId
        ).getInterceptor()
    )

    private messagingPipelineDriverHost: MessagingPipelineDriverHost
    private subscriptions: ((payload: MessagingPipelinePayload) => void)[] = []
    private onAuthAvailableSubscribers: (() => void)[] = []
    private onPipelinesInitialized = statefulPromise<void>()

    constructor(
        public readonly kvStore: KvStore,
        public readonly applicationId: string | undefined,
        public readonly mitterApiBaseUrl: string = MitterConstants.MitterApiUrl,
        private onTokenExpireFunctions: (() => void)[],
        mitterInstanceReady: () => void,
        pipelineDrivers: MessagingPipelineDriver[] | MessagingPipelineDriver,
        globalHostObject: any
    ) {
        this.getUserAuthorization()
            .then(authToken => (this.cachedUserAuthorization = authToken))
            .then(() => {
                if (this.cachedUserAuthorization !== undefined) {
                    this.announceAuthorizationAvailable()
                } else this.executeOnTokenExpireFunctions()
            })
            .then(mitterInstanceReady)
            .catch((err: any) => {
                throw new Error(`Error re-hydrating auth token ${err}`)
            })

        this.messagingPipelineDriverHost = new MessagingPipelineDriverHost(
            pipelineDrivers,
            this,
            kvStore,
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

    userAuthorizationAvailable(onAuthAvailable: () => void) {
        this.onAuthAvailableSubscribers.push(onAuthAvailable)
    }

    subscribeToPayload(subscription: (payload: MessagingPipelinePayload) => void) {
        this.subscriptions.push(subscription)
    }

    enableAxiosInterceptor(axiosInstance?: AxiosInstance) {
        this.mitterAxiosInterceptor.enable(axiosInstance)
    }

    disableAxiosInterceptor(axiosInstance?: AxiosInstance) {
        this.mitterAxiosInterceptor.disable(axiosInstance)
    }

    setUserAuthorization(authorizationToken: string) {
        if (this.cachedUserAuthorization === authorizationToken) {
            return
        }

        this.cachedUserAuthorization = authorizationToken
        this.announceAuthorizationAvailable()
        this.kvStore
            .setItem(Mitter.StoreKey.UserAuthorizationToken, authorizationToken)
            .catch((err: any) => {
                throw new Error(`Error storing key ${err}`)
            })
    }

    getUserAuthorization(): Promise<string | undefined> {
        if (this.cachedUserAuthorization !== undefined) {
            return Promise.resolve(this.cachedUserAuthorization)
        } else {
            return this.kvStore.getItem(Mitter.StoreKey.UserAuthorizationToken)
        }
    }

    setUserId(userId: string) {
        if (this.cachedUserId === userId) return
        this.kvStore.setItem(Mitter.StoreKey.UserId, userId).catch((err: any) => {
            throw new Error(`Error storing userId ${err}`)
        })
    }

    getUserId(): Promise<string> {
        if (this.cachedUserId !== undefined) {
            return Promise.resolve(this.cachedUserId)
        } else {
            return this.kvStore.getItem<string>(Mitter.StoreKey.UserId).then(userId => {
                if (userId === undefined) {
                    return this.me().userId.then(fetchedUserId => {
                        this.setUserId(fetchedUserId)
                        return fetchedUserId
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

    me(): MitterUser {
        return new MitterUser(this)
    }

    version() {
        return '0.4.2'
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
