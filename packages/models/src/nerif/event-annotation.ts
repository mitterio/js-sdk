export interface BaseEvent {}

enum EventLevel {
  Action,
  Atomic
}

export class NerifEvent {
  constructor(public eventName: string, public eventLevel: EventLevel) {}
}
