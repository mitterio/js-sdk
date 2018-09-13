import { MitterObject } from './mitter-objects'
import { ParticipatedChannel } from 'mitter-models'

export default class MitterParticipatedChannel extends MitterObject<
    MitterParticipatedChannel,
    ParticipatedChannel
> {
    get channelId() {
        return super.proxy('channelId')
    }

    get defaultRuleSet() {
        return super.proxy('defaultRuleSet')
    }

    get timelineEvents() {
        return super.proxy('timelineEvents')
    }

    get participation() {
        return super.proxy('participation')
    }

    get systemChannel() {
        return super.proxy('systemChannel')
    }

    get entityMetadata() {
        return super.proxy('entityMetadata')
    }

    get entityProfile() {
        return super.proxy('entityProfile')
    }

    get identifier() {
        return super.proxy('identifier')
    }
}
