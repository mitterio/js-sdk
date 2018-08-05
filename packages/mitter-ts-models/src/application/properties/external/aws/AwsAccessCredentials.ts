export class AwsAccessCredentials {
  constructor(
    public awsAccessKey: string,
    public awsAccessSecret: string | null,
    public awsRegion: string
  ) {}
}
