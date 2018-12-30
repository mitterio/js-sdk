import { TimelineEvent } from '../messaging/TimelineEvents'
import { ChannelParticipation, ParticipationStatus } from '../messaging/Channels'

export class MessageTimelineEvent {
  constructor(
    public messageId: string,
    public timelineEvent: TimelineEvent,
    public channelId: string | null
  ) {}
}

export class MessageTimelineEventSet {
  constructor(
    public messageId: string,
    public timelineEvents: Array<TimelineEvent>,
    public channelId: string | null
  ) {}
}

export class ChannelTimelineEvent {
  constructor(public channelId: string, public timelineEvent: TimelineEvent) {}
}

export class ChannelTimelineEventSet {
  constructor(public channelId: string, public timelineEvents: Array<TimelineEvent>) {}
}

export class PatchChannelParticipation {
  constructor(public newStatus: ParticipationStatus) {}
}

export class PatchChannelParticipationResult {
  constructor(
    public oldChannelParticipation: ChannelParticipation,
    public newChannelParticipation: ChannelParticipation
  ) {}
}
