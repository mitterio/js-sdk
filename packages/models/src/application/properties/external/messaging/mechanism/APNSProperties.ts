import { MessagingMechanismProperty } from './MessagingMechanismProperty'

export class APNSProperties extends MessagingMechanismProperty {
  constructor(public keyId: string, systemName: string, instanceName: string) {
    super(systemName, instanceName)
  }
}
