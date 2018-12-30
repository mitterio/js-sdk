import GoogleCredential from './GoogleCredential'

export class GoogleOAuthCredential extends GoogleCredential {
  constructor(
    public clientId: string,
    public clientSecret: string,
    systemName: string,
    instanceName: string
  ) {
    super(systemName, instanceName)
  }
}
