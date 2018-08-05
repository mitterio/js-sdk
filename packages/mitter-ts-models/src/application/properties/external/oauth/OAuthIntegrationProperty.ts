import ServiceIntegrationProperty from '../ServiceIntegrationProperty'

export class OAuthIntegrationProperty extends ServiceIntegrationProperty {
  /*/* in java it is extended but system and instance name are not passed*/
  constructor(
    public oauthRedirectUrl: string,
    public requireStateSigning: boolean,
    systemName: string,
    instanceName: string
  ) {
    super(systemName, instanceName)
  }
}
