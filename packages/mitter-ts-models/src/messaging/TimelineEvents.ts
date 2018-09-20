import IdentifiableEntity from '../annotations/IdentifiableEntity'

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
    public eventId: string,
    public type: string,
    public eventTimeMs: number,
    public subject: { identifier: string }
  ) {}

  identifier(): string {
    return this.eventId
  }
}