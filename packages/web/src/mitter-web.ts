import { Mitter as MitterCore, MitterConstants, PlatformImplementedFeatures } from '@mitter-io/core'
import WebKvStore from './kv-store/KvStore'
import WebSocketPipelineDriver from './drivers/WebSocketMessagingPipelineDriver'
import {noOp} from "./utils";

type TokenExpireFunction = () => void

export { WebKvStore }
export { TokenExpireFunction }

export const Mitter = {
    forWeb: function(
        applicationId: string | undefined = undefined,
        weaverUrl:string,
        mitterApiBaseUrl: string = MitterConstants.MitterApiUrl,
        initMessagingPipelineSubscriptions: Array<string> = [],
        disableXHRCaching: boolean = true,
        mitterInstanceReady: () => void = () => {},
        onTokenExpire: TokenExpireFunction[] = [],
        onMessagingPipelineConnectCb: (initSubscription: Array<string>) => void = (initSubscription: Array<string>) => {noOp()}
): MitterCore {
        return new MitterCore(
            new WebKvStore(),
            applicationId,
            mitterApiBaseUrl,
            weaverUrl,
            new WebSocketPipelineDriver(),
            window,
            initMessagingPipelineSubscriptions,
            {} as PlatformImplementedFeatures,
            disableXHRCaching,
            mitterInstanceReady,
            onTokenExpire,
            onMessagingPipelineConnectCb
        )
    }
}
