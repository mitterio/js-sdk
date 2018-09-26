function generatePipelinePayloadMatcher<T>(payloadType: string): (input: any) => input is T {
    return (input: any): input is T => {
        return input['@type'] !== undefined && input['@type'] === payloadType
    }
}

export const isNewMessagePayload = generatePipelinePayloadMatcher('new-message-payload')
export const isNewChannelPayload = generatePipelinePayloadMatcher('new-channel-payload')

export const isNewMessageTimelineEventPayload = generatePipelinePayloadMatcher(
    'new-message-timeline-event-payload'
)
export const isNewChannelTimelineEventPayload = generatePipelinePayloadMatcher(
    'new-channel-timeline-event-payload'
)

export const isParticipantChangedEventPayload = generatePipelinePayloadMatcher(
    'participant-changed-event-payload'
)

export const isChannelStreamData = generatePipelinePayloadMatcher('stream-data')

export const isPipelineControlPayload = generatePipelinePayloadMatcher('pipeline-control-payload')
