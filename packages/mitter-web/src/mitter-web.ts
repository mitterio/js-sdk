import { Mitter as MitterCore, MitterConstants } from 'mitter-core'
import WebKvStore from './kv-store/KvStore'
import { WebSocketPipelineDriver } from './drivers/WebSocketPipelineDriver'

type TokenExpireFunction = () => void

export * from './drivers/WebSocketPipelineDriver'

export { WebKvStore }
export { TokenExpireFunction }

export const Mitter = {
    forWeb: function(
        applicationId: string,
        onTokenExpire: TokenExpireFunction[] = [],
        mitterApiBaseUrl: string = MitterConstants.MitterApiUrl
    ): MitterCore {
        return new MitterCore(
            new WebKvStore(),
            applicationId,
            new WebSocketPipelineDriver(),
            onTokenExpire,
            window,
            () => {},
            mitterApiBaseUrl
        )
    }
}
