import { ReactElement } from 'react'

export type ProducerConfigs<C> = {
  condition: (item: C) => boolean,
  view: (item: C) => ReactElement<any>
}


export class Producer<T> {

  private condition: ProducerConfigs<T>['condition']
  private view: ProducerConfigs<T>['view']
  constructor(condition: ProducerConfigs<T>['condition'], view: ProducerConfigs<T>['view']) {
    this.condition = condition
    this.view = view

  }

  canProduceView(item: T){
    return this.condition(item) || false
  }

  produceView(item: T) {
    return this.view(item)
  }

}
