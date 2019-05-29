import {Presence, StandardUserPresenceTypeNames} from "@mitter-io/models";

export const StandardUserPresenceTypes = {
    online(timeToLive: number = 0): Presence {
        return new Presence(
            StandardUserPresenceTypeNames.Online,
            timeToLive
        )
    },

    sleeping(timeToLive: number = 0): Presence {
        return new Presence(
            StandardUserPresenceTypeNames.Sleeping,
            timeToLive
        )
    },

    away(timeToLive: number = 0): Presence {
        return new Presence(
            StandardUserPresenceTypeNames.Away,
            timeToLive
        )
    },

    missing(timeToLive: number = 0): Presence {
        return new Presence(
            StandardUserPresenceTypeNames.Missing,
            timeToLive
        )
    },

    offline(timeToLive: number = 0): Presence {
        return new Presence(
            StandardUserPresenceTypeNames.Offline,
            timeToLive
        )
    },
}

