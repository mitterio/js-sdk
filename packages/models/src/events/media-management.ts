import { ApplicationEvent } from './central'

export enum MediaManagementEventNames {
  HostedBinaryAvailableEvent = 'mitter.mpe.media.HostedBinaryAvailable'
}

export class HostedBinaryAvailableEvent extends ApplicationEvent {
  constructor(
    public resourceUri: string,
    public mediaKey: string,
    public representation: string,
    public mimeType: string,
    public contentLength: number,
    public applicationId: string
  ) {
    super(applicationId)
  }
}
