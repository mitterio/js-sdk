import {Identifier} from "../../annotations/Identifier";
import {RegisteredSubscription} from "./RegisteredSubscription";


export type RegisteredDeliveryTarget = {
    deliveryTargetId: Identifier,
    autoSubscriptions: RegisteredSubscription
}

/**
 * Delivery targets with mapped user id: {
    "deliveryTargetId": {
        "identifier": "deliveryTargetId"
    },
    "autoSubscriptions": [
        {
            "tag": "user-target",
            "descriptor": "/users/me",
            "subscriptionId": "FYZpZ-0Vi5O-FIGDL-Plbjf"
        }
    ]
}
 Delivery targets for anonymous user:
 {
    "deliveryTargetId": {
        "identifier": "deliveryTargetId"
    },
    "autoSubscriptions": []
}

 taken from https://git.mitter.io/mitter-io/mitter-io-central/wikis/Delivery-targets-&-subscription-models
 */
