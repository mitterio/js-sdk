export abstract class MessagingPipelinePayload {
  public '@type': string
  protected constructor(public globalPipelinePayloadId: string, type: string) {
    this['@type'] = type
  }
}

export class SerializedMessagePipelinePayload {
  constructor(public data: string) {}
}
