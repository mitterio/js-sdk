import { DeliveryEndpoint, MessagingPipelinePayload, DeliveryTarget } from '@mitter-io/models'
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

export interface BasePipelineSink {
    received(payload: MessagingPipelinePayload): void
}

export interface PipelineSink extends BasePipelineSink {
    endpointInvalidated(deliveryTarget: DeliveryTarget): void
    authorizedUserUnavailable(): void
    statusUpdate(newStatus: PipelineStatus): void
}

export default interface MessagingPipelineDriver {
    initialize(mitter: Mitter): PipelineDriverInitialization

    getDeliveryTarget(): Promise<DeliveryTarget | undefined>

    deliveryTargetRegistered(pipelineSink: PipelineSink, userDeliveryTarget: DeliveryTarget): void

    pipelineSinkChanged?(pipelineSink: BasePipelineSink): void

    halt(): void
}
