import ApplicationProperty from '../ApplicationProperty'

abstract class ServiceIntegrationProperty extends ApplicationProperty {
  protected constructor(public systemName: string, public instanceName: string) {
    super(systemName, instanceName)
  }
}

export default ServiceIntegrationProperty
