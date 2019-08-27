import { Mitter as MitterCore, MitterConstants, PlatformImplementedFeatures, MitterCoreConfig, MitterUserConfig, MitterUserCbs } from '@mitter-io/core'
import WebKvStore from './kv-store/KvStore'
import WebSocketPipelineDriver from './drivers/WebSocketMessagingPipelineDriver'
import {getDefaultMitterUserCbs, getMitterCoreConfig} from './utils';
import nanoid from 'nanoid'

export const Mitter = {
    forWeb: function(
        mitterUserConfig: MitterUserConfig,
        mitterUserCbs?: Partial<MitterUserCbs>
): MitterCore {
        return new MitterCore(
          getMitterCoreConfig(mitterUserConfig),
          getDefaultMitterUserCbs(mitterUserCbs),
          new WebKvStore(),
          new WebSocketPipelineDriver(),
          window,
          {
            randomIdGenerator: nanoid
          } as PlatformImplementedFeatures
        )
    }
}
