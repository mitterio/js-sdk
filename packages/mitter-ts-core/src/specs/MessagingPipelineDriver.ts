import { DeliveryEndpoint, MessagingPipelinePayload } from 'mitter-models'
import { Mitter } from './../mitter-core'

export interface PipelineDriverSpec {
    name: string
}

export enum PipelineStatus {
    Connected,
    Unavailable,
    Disrupted,
    ConnectionInProgress
}

export interface PipelineDriverInitialization {
    pipelineDriverSpec: PipelineDriverSpec
    initialized: Promise<void | boolean>
}

export interface PipelineSink {
    received(payload: MessagingPipelinePayload): void
    endpointInvalidated(deliveryEndpoint: DeliveryEndpoint): void
    authorizedUserUnavailable(): void
    statusUpdate(newStatus: PipelineStatus): void
}

export default interface MessagingPipelineDriver {
    initialize(mitter: Mitter): PipelineDriverInitialization

    getDeliveryEndpoint(): Promise<DeliveryEndpoint | undefined>

    endpointRegistered(pipelineSink: PipelineSink, userDeliveryEndpoint: DeliveryEndpoint): void

    halt(): void
}
