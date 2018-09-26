import { KvStore } from './mitter-core'
import { MitterAxiosApiInterceptor } from './MitterApiGateway'
import { MitterClientSet } from './MitterClientSet'
import { Identifiable } from './models/base-types'
import MessagingPipelineDriver from './specs/MessagingPipelineDriver'
import { MessagingPipelineDriverHost } from './driver-host/MessagingPipelineDriverHost'
import { MessagingPipelinePayload, User } from '@mitter-io/models'
import { MitterConstants } from './services/constants'
import { UserAuthorizationInterceptor } from './auth/user-interceptors'
import MitterUser from './objects/Users'

import { AxiosInstance } from 'axios'
import { statefulPromise } from './utils'

export interface MitterAxiosInterceptionHost {
    mitterApiBaseUrl: string
    enableAxiosInterceptor(axiosInstance: AxiosInstance): void
    disableAxiosInterceptor?(axiosInstance: AxiosInstance): void
}

export abstract class MitterBase implements MitterAxiosInterceptionHost {
    abstract mitterApiBaseUrl: string
    abstract enableAxiosInterceptor(axiosInstance: AxiosInstance): void

    version(): string {
        return '0.5.0'
    }

    clients(): MitterClientSet {
        return new MitterClientSet(this)
    }
}

export class Mitter extends MitterBase implements MitterAxiosInterceptionHost {
    // tslint:disable-next-line:variable-name
    private static readonly StoreKey = {
        UserAuthorizationToken: 'userAuthorizationToken',
        UserId: 'userId'
    }
    private cachedUserAuthorization: string | undefined = undefined
    private cachedUserId: string | undefined = undefined

    private mitterAxiosInterceptor: MitterAxiosApiInterceptor = new MitterAxiosApiInterceptor(
        /* the application if */
        this.applicationId,

        /* The generic request interceptor to use */
        new UserAuthorizationInterceptor(
            () => this.cachedUserAuthorization,
            this.applicationId
        ).getInterceptor(),

        /* The base url for mitter apis */
        this.mitterApiBaseUrl
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
        super()

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

    enableAxiosInterceptor(axiosInstance: AxiosInstance) {
        this.mitterAxiosInterceptor.enable(axiosInstance)
    }

    disableAxiosInterceptor(axiosInstance: AxiosInstance) {
        this.mitterAxiosInterceptor.disable(axiosInstance)
    }

    setUserAuthorization(authorizationToken: string) {
        if (authorizationToken.split('.').length === 3) {
            this.cachedUserId = JSON.parse(atob(authorizationToken.split('.')[1]))['userId']
        }

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
