import { KvStore } from './mitter-core'
import {
    MitterApiGateway,
    MitterAxiosApiInterceptor,
    MitterFetchApiInterceptor
} from './MitterApiGateway'
import MessagingPipelineDriver from './specs/MessagingPipelineDriver'
import { MessagingPipelineDriverHost } from './driver-host/MessagingPipelineDriverHost'
import { MessagingPipelinePayload } from 'mitter-models'
import { AxiosInstance } from 'axios'
import { MitterConstants } from './services/constants'

export class Mitter {
    // tslint:disable-next-line:variable-name
    private static readonly StoreKey = {
        UserAuthorizationToken: 'userAuthorizationToken',
        UserId: 'userId'
    }
    private cachedUserAuthorization: string | undefined = undefined
    public mitterApiGateway: MitterApiGateway = new MitterApiGateway(
        this.applicationId,
        () => this.cachedUserAuthorization
    )
    private cachedUserId: string | undefined = undefined
    private mitterFetchInterceptor: MitterFetchApiInterceptor = new MitterFetchApiInterceptor(
        this.applicationId,
        () => this.cachedUserAuthorization,
        () => this.executeOnTokenExpireFunctions
    )
    private mitterAxiosInterceptor: MitterAxiosApiInterceptor = new MitterAxiosApiInterceptor(
        this.applicationId,
        () => this.cachedUserAuthorization,
        () => this.executeOnTokenExpireFunctions
    )
    private messagingPipelineDriverHost: MessagingPipelineDriverHost
    private subscriptions: Array<(payload: MessagingPipelinePayload) => void> = []
    private onAuthAvailableSubscribers: Array<() => void> = []

    constructor(
        public kvStore: KvStore,
        public readonly applicationId: string,
        pipelineDrivers: Array<MessagingPipelineDriver> | MessagingPipelineDriver,
        private onTokenExpireFunctions: Array<() => void>,
        globalHostObject: any,
        public globalStore: any,
        public readonly mitterApiBaseUrl: string = MitterConstants.MitterApiUrl
    ) {
        this.getUserAuthorization()
            .then(authToken => (this.cachedUserAuthorization = authToken))
            .then(() => {
                if (this.cachedUserAuthorization !== undefined) {
                    this.announceAuthorizationAvailable()
                } else this.executeOnTokenExpireFunctions()
            })
            .catch(err => {
                throw new Error(`Error re-hydrating auth token ${err}`)
            })

        this.messagingPipelineDriverHost = new MessagingPipelineDriverHost(
            pipelineDrivers,
            this,
            kvStore
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

    enableFetchInterceptor() {
        // this.mitterFetchInterceptor.enable()
    }

    disableFetchInterceptor() {
        this.mitterFetchInterceptor.disable()
    }

    enableAxiosInterceptor(axiosInstance?: AxiosInstance) {
        this.mitterAxiosInterceptor.enable(axiosInstance)
    }

    disableAxiosInterceptor(axiosInstance?: AxiosInstance) {
        this.mitterAxiosInterceptor.disable(axiosInstance)
    }

    setUserAuthorization(authorizationToken: string) {
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

    getUserId(): Promise<string | undefined> {
        if (this.cachedUserId !== undefined) {
            return Promise.resolve(this.cachedUserId)
        } else {
            return this.kvStore.getItem(Mitter.StoreKey.UserId)
        }
    }

    getGlobalStore() {
        console.log('global store is', this.globalStore)
        return this.globalStore()
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
