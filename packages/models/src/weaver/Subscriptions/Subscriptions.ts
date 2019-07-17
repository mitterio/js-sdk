export abstract class Subscriptions {
    constructor(
        public subscriptionId: string,
        subscriptionType: string
    ) {
        (this as any)['@subscriptionType'] = subscriptionType
    }
}
