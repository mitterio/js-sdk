import IdentifiableEntity from '../annotations/IdentifiableEntity'
import { Identifier } from '../annotations/Identifier'

// tslint:disable-next-line:variable-name
export const StandardTimeLineEventTypeNames = {
    CreationTime: 'io.mitter.types.timeline.CreationTime',
    messages: {
        SentTime: 'mitter.mtet.SentTime',
        ReceivedTime: 'mitter.mtet.ReceivedTime',
        DeliveredTime: 'mitter.mtet.DeliveredTime',
        ReadTime: 'mitter.mtet.ReadTime'
    }
}

export class TimelineEvent implements IdentifiableEntity<TimelineEvent> {
    constructor(
        public type: string,
        public eventTimeMs: number,
        public subject: Identifier,
        public eventId: string | null = null
    ) {}

    identifier(): string {
        return this.eventId!
    }
}
