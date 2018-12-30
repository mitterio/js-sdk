enum StandardEndpointTypes {
  FcmDeliveryEndpoint = 'fcm',
  TransactionalWebHook = 'twh',
  SseWebEndpoint = 'http+sse'
}

export abstract class DeliveryEndpoint {
  protected constructor(
    public serializedEndpoint: string,
    public endpointType: string,
    public autoExpireAt: number = Number.MAX_SAFE_INTEGER
  ) {}
}

export class FcmDeliveryEndpoint extends DeliveryEndpoint {
  constructor(public registrationToken: string) {
    super(
      `${StandardEndpointTypes.FcmDeliveryEndpoint}:${registrationToken}`,
      StandardEndpointTypes.FcmDeliveryEndpoint
    )
  }
}

export class SseDeliveryEndpoint extends DeliveryEndpoint {
  constructor(public endpointToken: string | undefined = undefined) {
    super(
      `${StandardEndpointTypes.SseWebEndpoint}:${endpointToken}`,
      StandardEndpointTypes.SseWebEndpoint
    )
  }
}

export class TransactionalWebHookEndPoint extends DeliveryEndpoint {
  constructor(public webHookUri: string) {
    super(
      `${StandardEndpointTypes.TransactionalWebHook}:${webHookUri}`,
      StandardEndpointTypes.TransactionalWebHook
    )
  }
}

export class UserDeliveryEndPoint {
  constructor(
    public userId: string,
    public deliveryEndpoint: DeliveryEndpoint,
    public disabled: boolean = false
  ) {}
}
