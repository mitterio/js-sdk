import { ApplicationEvent } from './central'
import { DeliveryResult } from '../delman/delman-models'
import Identifiable from '../annotations/Identifiable'
import { User } from '../user/User'
import { MessagingPipelinePayload } from '../delman/chat/payloads'

export enum DeliveryManagementNames {
  PayloadDeliveryAttemptEvent = 'mitter.mpe.delivery.PayloadDeliveryAttempt',
  UserTargetDeliveryRequestedEvent = 'mitter.mpe.delivery.UserTargetDeliveryRequested',
  DeliveryEndpointRegisteredEvent = 'mitter.mpe.delivery.DeliveryEndpointRegistered',
  DeliveryEndpointUnregisteredEvent = 'mitter.mpe.delivery.DeliveryEndpointUnregistered',
  DeliveryEndpointTransferredEvent = 'mitter.mpe.delivery.DeliveryEndpointTransferred'
}

export class PayloadDeliveryAttemptEvent extends ApplicationEvent {
  constructor(
    public serializedDeliveryEndpoint: string,
    public deliveryResult: DeliveryResult,
    public payload: any,
    applicationId: string
  ) {
    super(applicationId)
  }
}

export class UserTargetDeliveryRequestedEvent extends ApplicationEvent {
  constructor(
    public user: Identifiable<User>,
    public messagingPipelinePayload: MessagingPipelinePayload,
    applicationId: string
  ) {
    super(applicationId)
  }
}

export class DeliveryEndpointRegisteredEvent extends ApplicationEvent {
  constructor(
    public user: Identifiable<User>,
    public deliveryEndpoint: string,
    applicationId: string
  ) {
    super(applicationId)
  }
}

export class DeliveryEndpointUnregisteredEvent extends ApplicationEvent {
  constructor(
    public user: Identifiable<User>,
    public deliveryEndpoint: string,
    applicationId: string
  ) {
    super(applicationId)
  }
}

export class DeliveryEndpointTransferredEvent extends ApplicationEvent {
  constructor(
    public deliveryEndponintId: string,
    public oldOwner: Identifiable<User>,
    public newOwner: Identifiable<User>,
    applicationId: string
  ) {
    super(applicationId)
  }
}
