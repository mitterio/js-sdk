import { MessagingMechanismProperty } from './MessagingMechanismProperty'

export class FCMProperties extends MessagingMechanismProperty {
  constructor(public serverKey: string, systemName: string, instanceName: string) {
    super(systemName, instanceName)
  }
}
