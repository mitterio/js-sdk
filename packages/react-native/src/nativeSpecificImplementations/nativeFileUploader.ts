import {
  GenericRequestParameters,
  UriConfig,
  BlobConfig,
  MULTIPART_MESSAGE_NAME_KEY,
  MULTIPART_MESSAGE_FILE_NAME
} from '@mitter-io/core'
import { Message, ChannelReferencingMessage } from '@mitter-io/models'
import base64 from 'base-64'
import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob'
import { base64ValidationRegex } from '../utils'

export function nativeFileUploader<T extends BlobConfig | UriConfig>(
  requestParams: GenericRequestParameters,
  channelId: string,
  message: Message,
  fileObject: T
): Error | Promise<ChannelReferencingMessage> {
  const data = RNFetchBlob.wrap((fileObject as UriConfig).uri)

  /** type is set to as any because the type is Methods in fetchblob and string in mitter core
   *  but it assumed that it will always have the correct HTTP method from mitter core
   * */
  return RNFetchBlob.fetch(requestParams.method as any, requestParams.path, requestParams.headers, [
    {
      name: fileObject.filename,
      filename: fileObject.filename,
      type: fileObject.type,
      data: data
    },
    {
      name: MULTIPART_MESSAGE_NAME_KEY,
      filename: MULTIPART_MESSAGE_FILE_NAME,
      type: 'application/json',
      data: base64.encode(JSON.stringify(message))
    }
  ]).then((res: FetchBlobResponse) => {
    const { status } = res.respInfo

    if ([400, 401, 403, 413].indexOf(status) > -1) {
      throw res.data
    }
    return res.data as Promise<ChannelReferencingMessage>
  })
}
