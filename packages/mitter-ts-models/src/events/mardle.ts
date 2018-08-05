import { Channel, ChannelParticipation } from '../messaging/Channels'
import { TimelineEvent } from '../messaging/TimelineEvents'
import { ApplicationEvent } from './central'
import { Message } from '../messaging/Messages'

abstract class ChannelEvent extends ApplicationEvent {
  constructor(public channelId: string, applicationId: string) {
    super(applicationId)
  }
}

export class NewChannelMessageEvent extends ChannelEvent {
  constructor(public message: Message, channelId: string, applicationId: string) {
    super(channelId, applicationId)
  }
}

export class ChannelMessageReadyEvent extends ChannelEvent {
  constructor(public message: Message, channelId: string, applicationId: string) {
    super(channelId, applicationId)
  }
}

export class NewChannelEvent extends ChannelEvent {
  constructor(public channel: Channel, channelId: string, applicationId: string) {
    super(channelId, applicationId)
  }
}

export class ChannelMessageDeletedEvent extends ChannelEvent {
  constructor(public deletedMessage: Message, channelId: string, applicationId: string) {
    super(channelId, applicationId)
  }
}

export class ChannelDeletedEvent extends ChannelEvent {
  constructor(public deletedChannel: Channel, channelId: string, applicationId: string) {
    super(channelId, applicationId)
  }
}

export class ChannelParticipatedAddedEvent extends ChannelEvent {
  constructor(
    public channelParticipation: ChannelParticipation,
    channelId: string,
    applicationId: string
  ) {
    super(channelId, applicationId)
  }
}

export class ChannelParticipationModifiedEvent extends ChannelEvent {
  constructor(
    public oldChannelParticipation: ChannelParticipation,
    public newChannelParticipation: ChannelParticipation,
    channelId: string,
    applicationId: string
  ) {
    super(channelId, applicationId)
  }
}

export class ChannelParticipantDeletedEvent extends ChannelEvent {
  constructor(
    public channelParticipation: ChannelParticipation,
    channelId: string,
    applicationId: string
  ) {
    super(channelId, applicationId)
  }
}

export class NewTimelineEventForMessageEvent extends ChannelEvent {
  constructor(
    public timeLineEvent: TimelineEvent,
    public messageId: string,
    channelId: string,
    applicationId: string
  ) {
    super(channelId, applicationId)
  }
}

export class NewTimelineEventForChannelEvent extends ChannelEvent {
  constructor(public timeLineEvent: TimelineEvent, channelId: string, applicationId: string) {
    super(channelId, applicationId)
  }
}

export class NewTimelineEventEvent extends ApplicationEvent {
  constructor(public timeLineEvent: TimelineEvent, applicationId: string) {
    super(applicationId)
  }
}

export class ChannelMessagesTruncatedEvent extends ChannelEvent {
  constructor(channelId: string, applicationId: string) {
    super(channelId, applicationId)
  }
}
