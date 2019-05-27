export enum StandardUserPresenceTypeNames {
  Online = 'mitter.up.Online',
  Sleeping = 'mitter.up.Sleeping',
  Away = 'mitter.up.Away',
  Missing = 'mitter.up.Missing',
  Offline = 'mitter.up.Offline'
}

export class Presence {
  constructor(public type: string, public timeToLive: number, public expiresTo?: Presence) {}
}

export class ImpressedPresence {
    constructor(presence: Presence, setTimeMs: number) {}
}
