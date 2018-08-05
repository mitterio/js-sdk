import ApplicationProperty from '../../ApplicationProperty'

export abstract class MessagingProperty extends ApplicationProperty {
  protected constructor(systemName: string, instanceName: string) {
    super(systemName, instanceName)
  }
}
