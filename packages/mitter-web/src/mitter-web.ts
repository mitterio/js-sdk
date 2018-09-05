import { Mitter as MitterCore, MitterConstants } from 'mitter-core'
import WebKvStore from './kv-store/KvStore'
import { WebSocketPipelineDriver } from 'mitter-core'

type TokenExpireFunction = () => void

export { WebKvStore }
export { TokenExpireFunction }

export const Mitter = {
    forWeb: function(
        applicationId: string | undefined = undefined,
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
