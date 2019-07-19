import { Mitter as MitterCore, MitterUserConfig, MitterUserHooks } from '@mitter-io/core'
import base64 from 'base-64'
import MitterFcmPipelineDriver from './drivers/MitterFcmPipelineDriver'
import NativeKvStore from './kv-store/kvStore'
import { nativeFileUploader } from './nativeSpecificImplementations/nativeFileUploader'
import { getDefaultMitterUserHooks, getMitterCoreConfig } from './utils'
import uuid from 'react-native-uuid'

export { NativeKvStore }
export const Mitter = {
  forReactNative: function(
    mitterUserConfig: MitterUserConfig,
    mitterUserHooks?: Partial<MitterUserHooks>
  ): MitterCore {
    return new MitterCore(
      getMitterCoreConfig(mitterUserConfig),
      getDefaultMitterUserHooks(mitterUserHooks),
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
