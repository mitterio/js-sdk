import { Mitter as MitterCore, MitterConstants } from '@mitter-io/core'
import base64 from 'base-64'
import MitterFcmPipelineDriver from './drivers/MitterFcmPipelineDriver'
import NativeKvStore from './kv-store/kvStore'
import { NativeFileUploader } from './NativeSpecificImplementations/NativeFileUploader'
import { noOp } from './utils'

type TokenExpireFunction = () => void
export { NativeKvStore }
export const Mitter = {
  forReactNative: function(
    applicationId: string | undefined = undefined,
    onTokenExpire: TokenExpireFunction[] = [],
    mitterApiBaseUrl: string = MitterConstants.MitterApiUrl,
    mitterInstanceReady: () => void = () => {
      noOp()
    }
  ): MitterCore {
    return new MitterCore(
      new NativeKvStore(),
      applicationId,
      mitterApiBaseUrl,
      onTokenExpire,
      mitterInstanceReady,
      new MitterFcmPipelineDriver(),
      global,
      {
        processMultipartRequest: NativeFileUploader,
        base64Decoder: base64.decode
      }
    )
  }
}
