import React, {ReactElement} from 'react'
import {ChannelReferencingMessage} from "@mitter-io/models";
import { Producer } from './Producer/Producer'
import {getViewFromProducer} from "./ViewProducers/utils";
import {NewMessageList} from "./NewMessageList";


type NewMessageListManagerProps =  {
  messages: ChannelReferencingMessage[]
  producers: Producer<ChannelReferencingMessage>[]
  defaultView: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (after?: string) => void
  fetchOlderMessages: (before?: string) => void
  loader: ReactElement<any>
  isFetching: boolean
}

type NewMessageListManagerState  = {

}

export class NewMessageListManager extends React.Component<NewMessageListManagerProps, NewMessageListManagerState> {
  constructor(props: NewMessageListManagerProps) {
    super(props)
  }

  getViewFromProducer(item: ChannelReferencingMessage) {
    return getViewFromProducer<ChannelReferencingMessage>(this.props.producers,item,this.props.defaultView)
  }

  render() {
    return (
      <NewMessageList
          messages = {this.props.messages}
          getViewFromProducer = {this.getViewFromProducer}
          fetchNewerMessages =  {this.props.fetchNewerMessages}
          fetchOlderMessages = {this.props.fetchOlderMessages}
          loader = {this.props.loader}
          isFetching = {this.props.isFetching}
        />
    )
  }
}
