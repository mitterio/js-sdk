import { MessagingPipelinePayload } from '../delman/chat/payloads'

export enum PacketTypes {
  NEW_MESSAGE = 'new-message',
  NEW_CHAT = 'new-chat',
  NEW_RECEIPT = 'new-receipt'
}

export class FcmPacket {
  constructor(
    public payload: MessagingPipelinePayload,
    public type: string,
    public fcmDiscriminator: string
  ) {}
}
