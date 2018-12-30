import GoogleCredential from './GoogleCredential'

export class GoogleApiCredential extends GoogleCredential {
  constructor(public apiKey: string, systemName: string, instanceName: string) {
    super(systemName, instanceName)
  }
}
