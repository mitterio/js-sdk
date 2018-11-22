import { Producer, ProducerConfigs } from '../Producer/Producer'
import {Channel} from '@mitter-io/models'

export function createChannelViewProducer(
  condition: ProducerConfigs<Channel>['condition'],
  view: ProducerConfigs<Channel>['view']
) {
  return new Producer<Channel>(condition,view)
}
