import { AwsServiceIntegrationProperty } from './AwsServiceIntegrationProperty'
import { AwsAccessCredentials } from './AwsAccessCredentials'

export class AwsSnsTopicProperty extends AwsServiceIntegrationProperty {
  constructor(
    public topicName: string,
    public region: string,
    public awsAccessCredentials: AwsAccessCredentials
  ) {
    super(region, awsAccessCredentials)
  }
}
