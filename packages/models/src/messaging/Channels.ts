import IdentifiableEntity from '../annotations/IdentifiableEntity'
import { AuditInfo } from '../commons/common-models'
import { User } from '../user/User'
import { TimelineEvent } from './TimelineEvents'
import { EntityMetadata } from '../entity/EntityMetadata'
import { EntityProfile } from '../entity/EntityProfile'
import { Identifier } from '../annotations/Identifier'
import { PickedPartial } from '../utils/PickedPartial'
import { AppliedAclList } from '../acolyte/AppliedAclList'

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
        public defaultRuleSet: string,
        public participation: Array<ChannelParticipation>,
        public entityProfile: EntityProfile,
        public channelId: string | null = null,
        public timelineEvents: Array<TimelineEvent> = [],
        public appliedAcls: AppliedAclList = { plusAppliedAcls: [], minusAppliedAcls: [] },
        public systemChannel: boolean = false,
        public entityMetadata: EntityMetadata = {},
        public auditInfo?: AuditInfo
    ) {}

    identifier(): string {
        return this.channelId!
    }
}

type RequiredChannelParams = 'defaultRuleSet' | 'participation'
export type RequestChannel = PickedPartial<Channel, RequiredChannelParams>

export class ChannelParticipation {
    constructor(
        public participantId: Identifier | string,
        public participationStatus: ParticipationStatus = ParticipationStatus.Active,
        public channelId: Identifier | string,
        public participant: User,
        public auditInfo?: AuditInfo
    ) {}
}

export class ParticipatedChannel {
    constructor(public participationStatus: ParticipationStatus, public channel: Channel) {}
}
