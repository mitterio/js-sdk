import {Subscriptions} from "./Subscriptions";
import {Identifier} from "../../annotations/Identifier";

export class UserResolutionSubscription extends Subscriptions {
    constructor(
        subscriptionId: string,
        public target: Identifier
    ) {
        super(subscriptionId, 'user-resolution-subscription')
    }
}


export type WiredUserResolutionSubscription   = {
    'subscriptionType': 'user-resolution-subscription',
    'subscriptionId': string,
    'target': Identifier,
} & Identifier
