import {Subscriptions} from "./Subscriptions";
import {Identifier} from "../../annotations/Identifier";

export class MessageResolutionSubscription extends Subscriptions{
    constructor(
        subscriptionId: string,
        public channelIds: Array<string>
    ) {
        super(subscriptionId, 'message-resolution-subscription')
    }
}

export type WiredMessageResolutionSubscription = {
    '@subscriptionType': 'message-resolution-subscription',
    'subscriptionId': string,
    'channelIds': Array<Identifier>
} & Identifier

/**
 * MessageResolutionSubscriptionResponse
 * {
    "@subscriptionType": "message-resolution-subscription",
    "subscriptionId": "subscriptionId",
    "channelIds": [
        {
            "identifier": "channelId"
        }
    ],
    "identifier": "subscriptionId"
}

 */
