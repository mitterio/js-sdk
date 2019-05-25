import React, {ReactElement, RefObject} from 'react'
import {ChannelReferencingMessage} from "@mitter-io/models";
import {Producer} from './Producer/Producer'
import {getViewFromProducer} from "./ViewProducers/utils";
import {NewMessageList} from "./NewMessageList";
import {isNewMessagePayload, Mitter} from "@mitter-io/core";
import {getChannelReferencingMessage} from "./utils";


type NewMessageListManagerProps = {
  messages: ChannelReferencingMessage[]
  producers: Producer<ChannelReferencingMessage>[]
  defaultView: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (after?: string) => Promise<ChannelReferencingMessage[]>
  fetchOlderMessages: (before?: string) => Promise<ChannelReferencingMessage[]>
  loader: ReactElement<any>
  isFetching: boolean
  mitter: Mitter
  channelId: string
  newMessagePayloadHook?: (message: ChannelReferencingMessage) => ChannelReferencingMessage
}

type NewMessageListManagerState = {
  refreshing: boolean
}

export class NewMessageListManager extends React.Component<NewMessageListManagerProps, NewMessageListManagerState> {
  getViewFromProducer = (item: ChannelReferencingMessage) => {
    return getViewFromProducer<ChannelReferencingMessage>(this.props.producers, item, this.props.defaultView)
  }
  private newMessageListRef: RefObject<NewMessageList>

  constructor(props: NewMessageListManagerProps) {
    super(props)
    this.state = {
      refreshing: false
    }
    this.newMessageListRef = React.createRef<NewMessageList>()
  }

  componentDidMount() {
    this.props.mitter.subscribeToPayload((payload) => {
      if (isNewMessagePayload(payload) && payload.channelId.identifier === this.props.channelId) {
        Promise.resolve(payload.message)
          .then(message => {
            const channelReferencingMessage = getChannelReferencingMessage(payload.channelId.identifier, payload.message)
            if (this.props.newMessagePayloadHook) {
              return this.props.newMessagePayloadHook(channelReferencingMessage)
            }
            return channelReferencingMessage
          })
          .then(message => {
            this.newMessageListRef.current!.onNewMessagePayload(message)
          })
          .catch(ex => {
            console.log('error in listeniong to new messages')
          })
      }
    })
  }

  componentDidUpdate(prevProps: NewMessageListManagerProps) {
    if(this.props.channelId !== prevProps.channelId) {
      this.refresh()
    }
  }

  refresh = () => {
    this.setState({refreshing: true})
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 100)
    }).then(() => {
      this.setState({refreshing: false})
    })
  }

  render() {
    if(this.state.refreshing) {
      return <div>Refreshing Channel</div>
    }

    return (
      <NewMessageList
        ref={this.newMessageListRef}
        initialMessages={this.props.messages}
        getViewFromProducer={this.getViewFromProducer}
        fetchNewerMessages={this.props.fetchNewerMessages}
        fetchOlderMessages={this.props.fetchOlderMessages}
        loader={this.props.loader}
      />
    )
  }
}
