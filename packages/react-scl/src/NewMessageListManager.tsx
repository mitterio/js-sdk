import React, {ReactElement, RefObject} from 'react'
import {ChannelReferencingMessage} from "@mitter-io/models";
import {Producer} from './Producer/Producer'
import {getViewFromProducer} from "./ViewProducers/utils";
import {NewMessageList} from "./NewMessageList";
import {isNewMessagePayload, Mitter} from "@mitter-io/core";
import {getChannelReferencingMessage} from "./utils";


type NewMessageListManagerProps = {
  channelId: string
  messages: ChannelReferencingMessage[]
  producers: Producer<ChannelReferencingMessage>[]
  defaultView: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (channelId: string, after?: string) => Promise<ChannelReferencingMessage[]>
  fetchOlderMessages: (channelId: string, before?: string) => Promise<ChannelReferencingMessage[]>
  minRowHeight: number
  fixedHeight?: boolean
  loader: ReactElement<any>
  mitter?: Mitter
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

  newMessagesReceived = (message: ChannelReferencingMessage[]) => {
    this.newMessageListRef.current!.onNewMessagePayload(message)
  }

  componentDidMount() {
    if(this.props.mitter) {
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
              this.newMessageListRef.current!.onNewMessagePayload([message])
            })
            .catch(ex => {
              console.log('error in listeniong to new messages')
            })
        }
      })
    }
  }

  componentDidUpdate(prevProps: NewMessageListManagerProps) {
    if(this.props.channelId !== prevProps.channelId && prevProps.channelId !== undefined) {
      this.refresh()
    }
  }

  refresh = () => {
    this.setState({refreshing: true})
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 500)
    }).then(() => {
      console.log('refreshing over')
      this.newMessageListRef = React.createRef<NewMessageList>()
      this.setState({refreshing: false})
    })
  }

  fetchNewerMessages = (after?: string) => {
    return this.props.fetchNewerMessages(this.props.channelId, after)
  }

  fetchOlderMessages = (before?: string) => {
    return this.props.fetchOlderMessages(this.props.channelId, before)
  }

  render() {
    if(this.state.refreshing) {
      return <div>Refreshing Channel</div>
    }

    return (
      <NewMessageList
        ref={this.newMessageListRef}
        initialMessages={this.props.messages}
        minRowHeight={this.props.minRowHeight}
        getViewFromProducer={this.getViewFromProducer}
        fetchNewerMessages={this.fetchNewerMessages}
        fetchOlderMessages={this.fetchOlderMessages}
        loader={this.props.loader}
        fixedHeight={!!this.props.fixedHeight}
      />
    )
  }
}
