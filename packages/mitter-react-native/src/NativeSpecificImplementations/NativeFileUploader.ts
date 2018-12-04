import { FileObject, GenericRequestParameters } from '@mitter-io/core'
import { Message } from '@mitter-io/models'
import base64 from 'base-64'
import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob'
import { base64ValidationRegex } from '../utils'


export function NativeFileUploader<T extends File | string>(requestParams: GenericRequestParameters, channelId: string, message: Message, fileObject: FileObject<T>): Promise<Message> {

  const isBase64EncodedData = base64ValidationRegex.test(fileObject.data as string)
  let data: string = fileObject.data as string

  if (!isBase64EncodedData) {
    data = RNFetchBlob.wrap(data)
  }

  return RNFetchBlob.fetch(requestParams.method, requestParams.path, requestParams.headers,
    [{
      name: fileObject.filename, filename: fileObject.filename, type: fileObject.type, data: data
    },
    {
      name: 'io.mitter.wire.requestbody',
      filename: 'params.json',
      type: 'application/json',
      data: base64.encode(JSON.stringify(message))
    }]
  )
    .then((res: FetchBlobResponse) => {
      return res.data as Promise<Message>
  })
}
