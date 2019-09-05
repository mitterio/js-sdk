import { Mitter as MitterCore, MitterUserConfig, MitterUserCbs } from '@mitter-io/core'
import base64 from 'base-64'
import MitterFcmPipelineDriver from './drivers/MitterFcmPipelineDriver'
import NativeKvStore from './kv-store/kvStore'
import { nativeFileUploader } from './nativeSpecificImplementations/nativeFileUploader'
import { getDefaultMitterUserCbs, getMitterCoreConfig } from './utils'
import uuid from 'react-native-uuid'

export { NativeKvStore }

export const Mitter = {
  forReactNative: function(
    mitterUserConfig: MitterUserConfig,
    mitterUserCbs?: Partial<MitterUserCbs>
  ): MitterCore {
    return new MitterCore(
      getMitterCoreConfig(mitterUserConfig),
      getDefaultMitterUserCbs(mitterUserCbs),
      new NativeKvStore(),
      new MitterFcmPipelineDriver(),
      global,
      {
        processMultipartRequest: nativeFileUploader,
        base64Decoder: base64.decode,
        randomIdGenerator: uuid.v4
      }
    )
  }
}
