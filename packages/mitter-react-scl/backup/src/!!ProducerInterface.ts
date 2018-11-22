import { ReactElement } from 'react'

export  interface ProducerInterfaceConstructor<T> {
  new(condition: (item: T) => boolean, view : ReactElement<any>): ProducerInterface<T>
}

export interface ProducerInterface<T> {
  /*producerObj: {
    condition: (item: T) => boolean,
    view: ReactElement<any>
  }*/
  canProduceView: (item: T) =>  boolean
  produceView: () => ReactElement<any>
}

