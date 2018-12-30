import GoogleCredential from './GoogleCredential'

export class GoogleServiceAccountCredential extends GoogleCredential {
  constructor(public config: object, systemName: string, instanceName: string) {
    super(systemName, instanceName)
  }
}
