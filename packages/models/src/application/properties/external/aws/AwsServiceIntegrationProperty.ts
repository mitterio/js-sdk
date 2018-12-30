import { AwsAccessCredentials } from './AwsAccessCredentials'

export class AwsServiceIntegrationProperty {
  constructor(public region: string, public awsAccessCredentials: AwsAccessCredentials) {}
}
