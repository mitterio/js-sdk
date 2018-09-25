import IdentifiableEntity from '../annotations/IdentifiableEntity'
import { TimelineEvent } from './TimelineEvents'
import { EntityMetadata } from './../entity/EntityMetadata'
import { EntityProfile } from './../entity/EntityProfile'

export enum StandardRuleSetNames {
  DirectMessage = 'io.mitter.ruleset.chats.DirectMessage',
  GroupChat = 'io.mitter.ruleset.chats.GroupChat',
  SystemChannel = 'io.mitter.ruleset.chats.SystemChannel',
  SingleParticipantChannel = 'io.mitter.ruleset.chats.SingleParticipantChannel'
}

export enum ParticipationStatus {
  Active = 'Active',
  ReadOnly = 'ReadOnly',
  Disabled = 'Disabled'
}

export class Channel implements IdentifiableEntity<Channel> {
  constructor(
    public channelId: string,
    public defaultRuleSet: string,
    public participation: Array<ChannelParticipation>,
    public timelineEvents: Array<TimelineEvent>,
    public systemChannel: boolean,
    public entityMetadata: EntityMetadata,
    public entityProfile: EntityProfile
  ) {}

  identifier(): string {
    return this.channelId
  }
}

export class ChannelParticipation {
  constructor(
    public participant: { identifier: string },
    public participationStatus: ParticipationStatus = ParticipationStatus.Active,
    public channelId: string
  ) {}
}

export class ParticipatedChannel {
  constructor(public participationStatus: ParticipationStatus, public channel: Channel) {}
}
