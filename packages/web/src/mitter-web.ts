import { Mitter as MitterCore, MitterConstants, PlatformImplementedFeatures } from '@mitter-io/core'
import WebKvStore from './kv-store/KvStore'
import WebSocketPipelineDriver from './drivers/WebSocketMessagingPipelineDriver'

type TokenExpireFunction = () => void

export { WebKvStore }
export { TokenExpireFunction }

export const Mitter = {
    forWeb: function(
        applicationId: string | undefined = undefined,
        onTokenExpire: TokenExpireFunction[] = [],
        mitterApiBaseUrl: string = MitterConstants.MitterApiUrl,
        mitterInstanceReady: () => void = () => {}
    ): MitterCore {
        return new MitterCore(
            new WebKvStore(),
            applicationId,
            mitterApiBaseUrl,

            onTokenExpire,

            mitterInstanceReady,
            new WebSocketPipelineDriver(),
            window,
            {} as PlatformImplementedFeatures
        )
    }
}
