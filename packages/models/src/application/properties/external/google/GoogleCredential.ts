import ServiceIntegrationProperty from '../ServiceIntegrationProperty'

abstract class GoogleCredential extends ServiceIntegrationProperty {
  public readonly projectNumber: string | undefined
  public readonly applicationName: string | undefined

  protected constructor(
    systemName: string,
    instanceName: string,
    projectNumber: string | undefined = undefined,
    applicationName: string | undefined = undefined
  ) {
    super(systemName, instanceName)
  }
}

export default GoogleCredential
