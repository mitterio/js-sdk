import { AuditInfo } from '../commons/common-models'
import { User } from '../user/User'
import {TimelineEvent} from './TimelineEvents'
import {EntityMetadata, MetadataAttachable} from '../entity/EntityMetadata'
import {AppliedAclList} from '../acolyte/AppliedAclList'
import {Identifier} from '../annotations/Identifier'
import {PickedPartial} from '../utils/ts-types'
import {Channel} from "./Channels";

export enum StandardPayloadTypeNames {
    TextMessage = 'mitter.mt.Text',
    FormattedTextMessage = 'mitter.mt.FormattedText',
    LinkInsetTextMessage = 'mitter.mt.LinkInsetText',
    ImageMessage = 'mitter.mt.Image',
    EmptyMessage = 'mitter.mt.Empty',
    FileMessage = 'mitter.mt.File'
}

export enum StandardMessageType {
    Standard = 'Standard',
    Notification = 'Notification',
    OutOfBand = 'OutOfBand'
}

export class MessageDatum {
    constructor(
        public dataType: string,
        public data: {
            [key: string]: any
        }
    ) {
    }
}

export class Message implements MetadataAttachable {
    constructor(
        public senderId: Identifier | string,
        public textPayload: string,
        public timelineEvents: Array<TimelineEvent>,
        public messageData: Array<MessageDatum> = [],
        public appliedAcls: AppliedAclList,
        public payloadType: string = StandardPayloadTypeNames.TextMessage,
        public messageId: string | null = null,
        public messageType: StandardMessageType = StandardMessageType.Standard,
        public entityMetadata: EntityMetadata = {},
        public auditInfo?: AuditInfo,
        public sender?: User,
        public channel?: Channel
    ) {
    }
}

type RequiredMessageParams = 'senderId' | 'textPayload' | 'timelineEvents'
export type RequestMessage = PickedPartial<Message, RequiredMessageParams>


export class ChannelReferencingMessage implements MetadataAttachable {
    constructor(
        public channelId: Identifier,
        public messageId: string,
        public messageType: StandardMessageType = StandardMessageType.Standard,
        public payloadType: string = StandardPayloadTypeNames.TextMessage,
        public senderId: Identifier,
        public textPayload: string,
        public messageData: Array<MessageDatum> = [],
        public timelineEvents: Array<TimelineEvent>,
        public entityMetadata: EntityMetadata,
        public auditInfo?: AuditInfo,
        public sender?: User,
        public channel?: Channel
    ) {
    }
}
