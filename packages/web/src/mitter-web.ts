import { Mitter as MitterCore, MitterConstants, PlatformImplementedFeatures, MitterCoreConfig, MitterUserConfig, MitterUserHooks } from '@mitter-io/core'
import WebKvStore from './kv-store/KvStore'
import WebSocketPipelineDriver from './drivers/WebSocketMessagingPipelineDriver'
import {getDefaultMitterUserHooks, getMitterCoreConfig} from './utils';

export const Mitter = {
    forWeb: function(
        mitterUserConfig: MitterUserConfig,
        mitterUserHooks?: Partial<MitterUserHooks>
): MitterCore {
        return new MitterCore(
          getMitterCoreConfig(mitterUserConfig),
          getDefaultMitterUserHooks(mitterUserHooks),
          new WebKvStore(),
          new WebSocketPipelineDriver(),
          window,
          {} as PlatformImplementedFeatures
        )
    }
}
