import { Message, ChannelReferencingMessage } from '@mitter-io/models'
import { GenericRequestParameters } from '../auth/interceptors-base'
import { BlobConfig, UriConfig } from '../services/MessagesClient'

export interface PlatformImplementedFeatures {
    processMultipartRequest:
        | (<T extends BlobConfig | UriConfig>(
              requestParams: GenericRequestParameters,
              channelId: string,
              message: Message,
              fileObject: T
          ) => Promise<ChannelReferencingMessage> | Error)
        | undefined
    base64Decoder: undefined | ((encodedString: string) => string)
}
