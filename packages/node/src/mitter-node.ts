import {
    MitterBase,
    MitterAxiosApiInterceptor,
    MitterConstants,
    PlatformImplementedFeatures,
    MitterApiConfiguration,
    MitterUserHooks,
} from '@mitter-io/core'
import { AxiosInstance } from 'axios'
import { AccessKeySigningInterceptor } from './auth/access-key-interceptor'
import { AccessKeyApplicationCredentials } from './auth/application-credentials'
import {MitterNodeCoreConfig, MitterNodeUserConfig, MitterNodeUserHooks} from "./config";
import {getDefaultMitterUserHooks, getMitterNodeCoreConfig} from './utils';

export class MitterNode extends MitterBase {
    private accessKeySigningInterceptor: AccessKeySigningInterceptor

    constructor(
        public  mitterNodeCoreConfig: MitterNodeCoreConfig,
        /*private applicationId: string,
        private accessKey: AccessKeyApplicationCredentials,
        public mitterApiBaseUrl: string,*/
        private mitterUserHooks: MitterUserHooks
    ) {
        super()
        this.accessKeySigningInterceptor = new AccessKeySigningInterceptor(mitterNodeCoreConfig.accessKey)
    }

    version() {
        return '0.5.0'
    }

    setMitterHooks = (hooks: Partial<MitterUserHooks> = {}) => {
        this.mitterUserHooks = {
            ...this.mitterUserHooks,
            ...hooks,

        }
    }

    getMitterHooks = () => {
        return this.mitterUserHooks
    }



    enableAxiosInterceptor(axiosInstance: AxiosInstance) {
        new MitterAxiosApiInterceptor(
            /* the application id */
            this.mitterNodeCoreConfig.applicationId,

            /* the default signing interceptor to use */
            this.accessKeySigningInterceptor.getInterceptor(),

            this.mitterNodeCoreConfig.mitterApiBaseUrl,
            false
        ).enable(axiosInstance)
    }

    platformImplementedFeaturesProvider = () => {
        return {} as PlatformImplementedFeatures
    }

    mitterApiConfigurationProvider = () => {
        return new MitterApiConfiguration(
            this.accessKeySigningInterceptor.getInterceptor(),
            this.mitterNodeCoreConfig.mitterApiBaseUrl,
            this.enableAxiosInterceptor.bind(this)
        )
    }
}

export const Mitter = {
    forNode: function(
        mitterNodeUserConfig: MitterNodeUserConfig,
        mitterNodeUserHooks?: MitterNodeUserHooks
    ): MitterNode {
        return new MitterNode(
            getMitterNodeCoreConfig(mitterNodeUserConfig),
            getDefaultMitterUserHooks(mitterNodeUserHooks)
        )
    }
}

export * from './auth/application-credentials'
