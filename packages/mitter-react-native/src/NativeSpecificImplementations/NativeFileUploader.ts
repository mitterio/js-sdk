import {
  GenericRequestParameters,
  UriConfig,
  BlobConfig,
  MULTIPART_MESSAGE_NAME_KEY,
  MULTIPART_MESSAGE_FILE_NAME
} from '@mitter-io/core'
import { Message } from '@mitter-io/models'
import base64 from 'base-64'
import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob'
import { base64ValidationRegex } from '../utils'

export function NativeFileUploader<T extends BlobConfig | UriConfig>(
  requestParams: GenericRequestParameters,
  channelId: string,
  message: Message,
  fileObject: T
): Promise<Message> {
  const data = RNFetchBlob.wrap((fileObject as UriConfig).uri)

  return RNFetchBlob.fetch(requestParams.method, requestParams.path, requestParams.headers, [
    {
      name: fileObject.filename,
      filename: fileObject.filename,
      type: fileObject.type,
      data: data
    },
    {
      name: MULTIPART_MESSAGE_FILE_NAME,
      filename: MULTIPART_MESSAGE_NAME_KEY,
      type: 'application/json',
      data: base64.encode(JSON.stringify(message))
    }
  ]).then((res: FetchBlobResponse) => {
    return res.data as Promise<Message>
  })
}
