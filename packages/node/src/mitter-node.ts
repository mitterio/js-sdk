import {
    MitterBase,
    MitterAxiosApiInterceptor,
    MitterConstants,
    PlatformImplementedFeatures,
    MitterApiConfiguration
} from '@mitter-io/core'
import { AxiosInstance } from 'axios'
import { AccessKeySigningInterceptor } from './auth/access-key-interceptor'
import { AccessKeyApplicationCredentials } from './auth/application-credentials'

export class MitterNode extends MitterBase {
    private accessKeySigningInterceptor: AccessKeySigningInterceptor

    constructor(
        private applicationId: string,
        private accessKey: AccessKeyApplicationCredentials,
        public mitterApiBaseUrl: string
    ) {
        super()
        this.accessKeySigningInterceptor = new AccessKeySigningInterceptor(accessKey)
    }

    version() {
        return '0.5.0'
    }

    enableAxiosInterceptor(axiosInstance: AxiosInstance) {
        new MitterAxiosApiInterceptor(
            /* the application id */
            this.applicationId,

            /* the default signing interceptor to use */
            this.accessKeySigningInterceptor.getInterceptor(),

            this.mitterApiBaseUrl
        ).enable(axiosInstance)
    }

    platformImplementedFeaturesProvider = () => {
        return {} as PlatformImplementedFeatures
    }

    mitterApiConfigurationProvider = () => {
        return new MitterApiConfiguration(
            this.accessKeySigningInterceptor.getInterceptor(),
            this.mitterApiBaseUrl,
            this.enableAxiosInterceptor.bind(this)
        )
    }
}

export const Mitter = {
    forNode: function(
        applicationId: string,
        accessKey: AccessKeyApplicationCredentials,
        mitterApiBaseUrl: string = MitterConstants.MitterApiUrl
    ): MitterNode {
        return new MitterNode(applicationId, accessKey, mitterApiBaseUrl)
    }
}

export * from './auth/application-credentials'
