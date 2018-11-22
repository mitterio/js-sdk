import { ReactElement } from 'react'
import { Producer } from '../Producer/Producer'


export function getViewFromProducer<T>(producers: Producer<T>[] | undefined,
                                       item: T,
                                       defaultView: (item: T) => ReactElement<any>): ReactElement<any> {
  const producedView = defaultView
  if(producers !== undefined) {
    const viewProducingProducers = producers.filter(producer => {
      return ( producer.canProduceView(item) === true )
    })

    if (viewProducingProducers.length === 0) {
      return producedView(item)
    }
    return viewProducingProducers[0].produceView(item)
  }
  return producedView(item)
}
