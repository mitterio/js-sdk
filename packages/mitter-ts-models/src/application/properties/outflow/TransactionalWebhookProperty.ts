import ApplicationProperty from '../ApplicationProperty'

export class TransactionalWebhookProperty extends ApplicationProperty {
  constructor(public webhookUri: string, public eventSubscriptions: Array<string> = []) {
    super()
  }
}
