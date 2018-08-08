import { Mitter as MitterCore } from 'mitter-core'
import WebKvStore from './kv-store/KvStore'
import { WebSocketPipelineDriver } from './drivers/WebSocketPipelineDriver'

type TokenExpireFunction = () => {}

export * from './drivers/WebSocketPipelineDriver'

export { WebKvStore }
export { TokenExpireFunction }

export const Mitter = {
    forWeb: function(
        applicationId: string,
        onTokenExpire: TokenExpireFunction[] = [],
        mitterApiBaseUrl: string = ''
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
