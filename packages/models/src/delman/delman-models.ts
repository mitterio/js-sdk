enum DeliveryStatus {
  Success,
  PermanentFailure,
  RetryableFailure,
  Indeterminate
}

export class DeliveryResult {
  constructor(public deliveryStatus: DeliveryStatus) {}
}
