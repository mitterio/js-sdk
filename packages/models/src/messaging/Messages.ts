import {TimelineEvent} from './TimelineEvents'
import {EntityMetadata, MetadataAttachable} from '../entity/EntityMetadata'
import IdentifiableEntity from '../annotations/IdentifiableEntity'
import {AppliedAclList} from '../acolyte/AppliedAclList'
import {Identifier} from '../annotations/Identifier'
import {PickedPartial} from '../utils/PickedPartial'

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

export class Message implements IdentifiableEntity<Message>, MetadataAttachable {
    constructor(
        public senderId: Identifier | string,
        public textPayload: string,
        public timelineEvents: Array<TimelineEvent>,
        public messageData: Array<MessageDatum> = [],
        public appliedAcls: AppliedAclList,
        public payloadType: string = StandardPayloadTypeNames.TextMessage,
        public messageId: string | null = null,
        public messageType: StandardMessageType = StandardMessageType.Standard,
        public entityMetaData: EntityMetadata = {}
    ) {
    }

    identifier() {
        return this.messageId!
    }
}

type RequiredMessageParams = 'senderId' | 'textPayload' | 'timelineEvents'
export type RequestMessage = PickedPartial<Message, RequiredMessageParams>

export class ChannelReferencingMessage implements IdentifiableEntity<Message>, MetadataAttachable {
    constructor(
        public channelId: string,
        public messageId: string,
        public messageType: StandardMessageType = StandardMessageType.Standard,
        public payloadType: string = StandardPayloadTypeNames.TextMessage,
        public senderId: Identifier,
        public textPayload: string,
        public messageData: Array<MessageDatum> = [],
        public timelineEvents: Array<TimelineEvent>,
        public entityMetaData: EntityMetadata
    ) {
    }

    identifier() {
        return this.messageId
    }
}
