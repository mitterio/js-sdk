import { Channel, ParticipationStatus } from '../../messaging/Channels'
import { TimelineEvent } from '../../messaging/TimelineEvents'
import { ContextFreeMessage } from '../../messaging/ContextFreeMessage'
import { MessagingPipelinePayload } from './payloads'
import { Message } from '../../messaging/Messages'
import { Identifier } from '../../annotations/Identifier'

export enum StandardPipelinePayloadNames {
    NewChannelPayload = 'new-channel-payload',
    NewMessagePayload = 'new-message-payload',

    NewMessageTimelineEventPayload = 'new-message-timeline-event-payload',
    NewChannelTimelineEventPayload = 'new-channel-timeline-event-payload',

    ParticipationChangedEventPayload = 'participation-changed-event-payload',
    ChannelStreamData = 'stream-data',

    PipelineControlPayload = 'pipeline-control-payload'
}

export class NewChannelPayload extends MessagingPipelinePayload {
    constructor(public channel: Channel, globalPipelinePayloadId: string, type: string) {
        super(globalPipelinePayloadId, type)
    }
}

export class NewMessagePayload extends MessagingPipelinePayload {
    constructor(
        public message: Message,
        public channelId: Identifier,
        globalPipelinePayloadId: string,
        type: string
    ) {
        super(globalPipelinePayloadId, type)
    }
}

export class NewMessageTimelineEventPayload extends MessagingPipelinePayload {
    constructor(
        public timelineEvent: TimelineEvent,
        public messageId: Identifier,
        globalPipelinePayloadId: string,
        type: string
    ) {
        super(globalPipelinePayloadId, type)
    }
}

export class NewChannelTimelineEventPayload extends MessagingPipelinePayload {
    constructor(
        public timelineEvent: TimelineEvent,
        public channelId: string,
        globalPipelinePayloadId: string,
        type: string
    ) {
        super(globalPipelinePayloadId, type)
    }
}

export class ParticipationChangedEventPayload extends MessagingPipelinePayload {
    constructor(
        public oldStatus: ParticipationStatus,
        public newStatus: ParticipationStatus,
        public participantId: string,
        public channelId: Identifier,
        globalPipelinePayloadId: string,
        type: string
    ) {
        super(globalPipelinePayloadId, type)
    }
}

export class ChannelStreamData extends MessagingPipelinePayload {
    constructor(
        public channelId: string,
        public streamId: string,
        public streamData: ContextFreeMessage,
        globalPipelinePayloadId: string,
        type: string
    ) {
        super(globalPipelinePayloadId, type)
    }
}

export class PipelineControlPayload extends MessagingPipelinePayload {
    constructor(
        public errorBody: any = undefined,
        public allOk: boolean = false,
        globalPipelinePayloadId: string,
        type: string
    ) {
        super(globalPipelinePayloadId, type)
    }
}
