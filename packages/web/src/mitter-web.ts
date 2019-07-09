import { Mitter as MitterCore, MitterConstants, PlatformImplementedFeatures, MitterCoreConfig, MitterUserConfig } from '@mitter-io/core'
import WebKvStore from './kv-store/KvStore'
import WebSocketPipelineDriver from './drivers/WebSocketMessagingPipelineDriver'
import {createMitterCoreConfig} from './utils';

export const Mitter = {
    forWeb: function(
        mitterUserConfig: MitterUserConfig
): MitterCore {
        return new MitterCore(
          createMitterCoreConfig(mitterUserConfig) ,
            new WebKvStore(),
            new WebSocketPipelineDriver(),
            window,
            {} as PlatformImplementedFeatures,

        )
    }
}
