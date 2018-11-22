import { ChannelReferencingMessage } from '@mitter-io/models'
import { Producer, ProducerConfigs } from '../Producer/Producer'

export function createMessageViewProducer(
  condition: ProducerConfigs<ChannelReferencingMessage>['condition'],
  view: ProducerConfigs<ChannelReferencingMessage>['view']
)
{
  return new Producer<ChannelReferencingMessage>(condition,view)
}
