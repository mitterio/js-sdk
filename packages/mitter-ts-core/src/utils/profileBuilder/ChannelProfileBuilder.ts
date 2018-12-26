import {
    EntityProfileAttribute,
    StandardChannelProfileAttributes,
    standardChannelProfileAttributes
} from '@mitter-io/models'

import ProfileBaseBuilder from './ProfileBaseBuilder'

export class ChannelProfileBuilder extends ProfileBaseBuilder<StandardChannelProfileAttributes> {
    private attributes: {
        [P in keyof StandardChannelProfileAttributes]: EntityProfileAttribute | undefined
    } = {
        displayName: undefined,
        description: undefined,
        channelIconURL: undefined,
        purpose: undefined
    }

    constructor() {
        super()
    }

    withDisplayName(displayName: string): ChannelProfileBuilder {
        this.attributes.displayName = this.addAttribute(
            standardChannelProfileAttributes.displayName,
            displayName
        )
        return this
    }

    withDescription(description: string): ChannelProfileBuilder {
        this.attributes.description = this.addAttribute(
            standardChannelProfileAttributes.description,
            description
        )
        return this
    }

    withChannelIconURL(channelIconURL: string): ChannelProfileBuilder {
        this.attributes.channelIconURL = this.addAttribute(
            standardChannelProfileAttributes.channelIconURL,
            channelIconURL
        )
        return this
    }

    withPurpose(purpose: string): ChannelProfileBuilder {
        this.attributes.purpose = this.addAttribute(
            standardChannelProfileAttributes.purpose,
            purpose
        )
        return this
    }

    buildProfile(): EntityProfileAttribute[] {
        for (const key in this.attributes) {
            if (this.attributes[key as keyof StandardChannelProfileAttributes] === undefined) {
                delete this.attributes[key as keyof StandardChannelProfileAttributes]
            }
        }

        return this.build<StandardChannelProfileAttributes>(this.attributes)
    }
}
