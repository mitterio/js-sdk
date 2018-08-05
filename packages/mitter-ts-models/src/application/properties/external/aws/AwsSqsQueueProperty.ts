import { AwsServiceIntegrationProperty } from './AwsServiceIntegrationProperty'
import { AwsAccessCredentials } from './AwsAccessCredentials'

export class AwsSqsQueueProperty extends AwsServiceIntegrationProperty {
  constructor(
    public queueName: string,
    public region: string,
    public awsAccessCredentials: AwsAccessCredentials
  ) {
    super(region, awsAccessCredentials)
  }
}
