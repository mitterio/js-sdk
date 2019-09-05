import Identifiable from '../annotations/Identifiable'
import { Message } from '../messaging/Messages'

enum SortOrder {
  Ascending,
  Descending,
  Implied
}

export class MessageQuery {
  /*AclAccessorSelector should be used instead of array*/
  constructor(
    public channelId: string,
    public limit: number = 10,
    public withReadSelectors: Array<string>,
    public beforeMessageId: string | null,
    public afterMessageId: string | null
  ) {}
}

export class AddableMessage {
  constructor(public message: Message) {}
}

export class ChannelMessageSet {
  constructor(public channelId: string, public messages: Array<Message>) {}
}

export class ChannelMessage {
  constructor(public channelId: string, public message: Message) {}
}

export class Paginated<T extends Identifiable<T>> {
  constructor(public data: Array<T>, public estimatedTotalCount: number) {}
}

export class EntityQuery<T extends Identifiable<T>> {
  /* AclAccessorSelector should be used instead of array */
  constructor(
    public beforeId: Identifiable<T> | null,
    public afterId: Identifiable<T> | null,
    public limit: number,
    public entityCountOffset: number,
    public sortOrder: SortOrder,
    public withReadSelectors: Array<string>
  ) {}
}
