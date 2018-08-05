import ApplicationProperty from '../ApplicationProperty'
import { AwsSqsQueueProperty } from '../external/aws/AwsSqsQueueProperty'
import { AwsSnsTopicProperty } from '../external/aws/AwsSnsTopicProperty'

class EventBusProperty extends ApplicationProperty {
  constructor(public active: boolean) {
    super()
  }
}

export class AwsSqsQueueEventBus extends EventBusProperty {
  constructor(public awsSqsQueueProperty: AwsSqsQueueProperty, active: boolean) {
    super(active)
  }
}

export class AwsSnsTopicEventBus extends EventBusProperty {
  constructor(public awsSnsTopicProperty: AwsSnsTopicProperty, active: boolean) {
    super(active)
  }
}
