import {
    NewMessagePayload,
    NewChannelTimelineEventPayload,
    ParticipationChangedEventPayload,
    NewChannelPayload,
    NewMessageTimelineEventPayload
} from '@mitter-io/models'

function generatePipelinePayloadMatcher<T>(payloadType: string): (input: any) => input is T {
    return (input: any): input is T => {
        return input['@type'] !== undefined && input['@type'] === payloadType
    }
}

export const isNewMessagePayload = generatePipelinePayloadMatcher<NewMessagePayload>(
    'new-message-payload'
)
export const isNewChannelPayload = generatePipelinePayloadMatcher<NewChannelPayload>(
    'new-channel-payload'
)

export const isNewMessageTimelineEventPayload = generatePipelinePayloadMatcher<
    NewMessageTimelineEventPayload
>('new-message-timeline-event-payload')
export const isNewChannelTimelineEventPayload = generatePipelinePayloadMatcher<
    NewChannelTimelineEventPayload
>('new-channel-timeline-event-payload')

export const isParticipantChangedEventPayload = generatePipelinePayloadMatcher<
    ParticipationChangedEventPayload
>('participant-changed-event-payload')

export const isChannelStreamData = generatePipelinePayloadMatcher('stream-data')

export const isPipelineControlPayload = generatePipelinePayloadMatcher('pipeline-control-payload')
