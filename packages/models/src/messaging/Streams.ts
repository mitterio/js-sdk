import IdentifiableEntity from '../annotations/IdentifiableEntity'

export class Stream implements IdentifiableEntity<Stream> {
  constructor(
    public streamId: string,
    public type: string,
    public supportedContentTypes: Array<string>
  ) {}

  identifier(): string {
    return this.streamId
  }
}

export class ChannelStream {
  constructor(public channelId: string, public stream: ChannelStream) {}
}
