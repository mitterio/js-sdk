import { Mitter as MitterCore, MitterUserConfig } from '@mitter-io/core'
import base64 from 'base-64'
import MitterFcmPipelineDriver from './drivers/MitterFcmPipelineDriver'
import NativeKvStore from './kv-store/kvStore'
import { nativeFileUploader } from './nativeSpecificImplementations/nativeFileUploader'
import { createMitterCoreConfig } from './utils'

export { NativeKvStore }
export const Mitter = {
  forReactNative: function(mitterUserConfig: MitterUserConfig): MitterCore {
    return new MitterCore(
      createMitterCoreConfig(mitterUserConfig),
      new NativeKvStore(),
      new MitterFcmPipelineDriver(),
      global,
      {
        processMultipartRequest: nativeFileUploader,
        base64Decoder: base64.decode
      }
    )
  }
}
