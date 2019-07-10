import { DeliveryEndpoint, MessagingPipelinePayload } from '@mitter-io/models'
import { Mitter } from './../mitter-core'
import {MessagingPipelineConnectCb} from "../config";

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
    endpointInvalidated(deliveryEndpoint: DeliveryEndpoint): void
    authorizedUserUnavailable(): void
    statusUpdate(newStatus: PipelineStatus): void
}

export default interface MessagingPipelineDriver {
    initialize(mitter: Mitter,
               initMessagingPipelineSubscriptions: Array<string>,
               onMessagingPipelineConnectCb: MessagingPipelineConnectCb[]
               ): PipelineDriverInitialization

    getDeliveryEndpoint(): Promise<DeliveryEndpoint | undefined>

    endpointRegistered(pipelineSink: PipelineSink, userDeliveryEndpoint: DeliveryEndpoint): void

    pipelineSinkChanged?(pipelineSink: BasePipelineSink): void

    halt(): void
}
