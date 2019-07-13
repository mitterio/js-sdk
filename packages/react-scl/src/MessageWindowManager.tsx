import React, {ReactElement, RefObject} from 'react'
import {ChannelReferencingMessage, MessagingPipelinePayload, NewMessagePayload} from "@mitter-io/models";
import {Producer} from './Producer/Producer'
import {getViewFromProducer} from "./ViewProducers/utils";
import MessageWindow from "./MessageWindow";
import {isNewMessagePayload, Mitter} from "@mitter-io/core";
import {getChannelReferencingMessage} from "./utils";


type MessageWindowManagerProps = {
  channelId: string
  messages: ChannelReferencingMessage[]
  producers: Producer<ChannelReferencingMessage>[]
  defaultView: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (channelId: string, after?: string) => Promise<ChannelReferencingMessage[]>
  fetchOlderMessages: (channelId: string, before?: string) => Promise<ChannelReferencingMessage[]>
  minRowHeight: number
  loader: ReactElement<any>
  fetchThreshold?: number
  fixedHeight?: boolean
  mitter?: Mitter
  newMessagePayloadHook?: (message: ChannelReferencingMessage) => ChannelReferencingMessage
  scrollIndicator?: (unreadCount: number, onClick: () => void) => ReactElement<any>
}

type MessageWindowManagerState = {
  refreshing: boolean
}

export class MessageWindowManager extends React.Component<MessageWindowManagerProps, MessageWindowManagerState> {

  private messageWindowRef: RefObject<MessageWindow>

  constructor(props: MessageWindowManagerProps) {
    super(props)
    this.state = {
      refreshing: false
    }
    this.messageWindowRef = React.createRef<MessageWindow>()
  }

  componentDidMount() {
    if (this.props.mitter) {
      this.props.mitter.subscribeToPayload((payload: MessagingPipelinePayload) => {
        if (isNewMessagePayload(payload) && (payload as NewMessagePayload).channelId.identifier === this.props.channelId) {
          Promise.resolve((payload as NewMessagePayload).message)
            .then(message => {
              const channelReferencingMessage = getChannelReferencingMessage((payload as NewMessagePayload).channelId.identifier, (payload as NewMessagePayload).message)
              if (this.props.newMessagePayloadHook) {
                return this.props.newMessagePayloadHook(channelReferencingMessage)
              }
              return channelReferencingMessage
            })
            .then(message => {
              this.pushNewMessage(JSON.parse((JSON.stringify(message))))
            })
            .catch(ex => {
              console.log('error in listening to new messages')
            })
        }
      })
    }
  }

  componentDidUpdate(prevProps: MessageWindowManagerProps) {
    if (this.props.channelId !== prevProps.channelId && prevProps.channelId !== undefined) {
      this.refresh()
    }
  }

  getViewFromProducer = (item: ChannelReferencingMessage) => {
    return getViewFromProducer<ChannelReferencingMessage>(this.props.producers, item, this.props.defaultView)
  }

  pushNewMessage = (toBeInsertedMessage: ChannelReferencingMessage) => {
    this.messageWindowRef.current!.onNewMessagePayload(toBeInsertedMessage)
  }

  refresh = () => {
    this.setState({refreshing: true})
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 500)
    }).then(() => {

      this.messageWindowRef = React.createRef<MessageWindow>()
      this.setState({refreshing: false})
    })
  }

  fetchNewerMessages = (after?: string) => {
    return this.props.fetchNewerMessages(this.props.channelId, after)
  }

  fetchOlderMessages = (before?: string) => {
    return this.props.fetchOlderMessages(this.props.channelId, before)
  }

  forceFetchNewerMessages = () => {
    const messageWindow = this.messageWindowRef.current
    if(messageWindow) {
      messageWindow.forceFetchNewerMessages()
    }
  }


  render() {
    if (this.state.refreshing) {
      return <React.Fragment/>
    }

    return (
      <MessageWindow
        ref={this.messageWindowRef}
        initialMessages={this.props.messages}
        minRowHeight={this.props.minRowHeight}
        getViewFromProducer={this.getViewFromProducer}
        fetchNewerMessages={this.fetchNewerMessages}
        fetchOlderMessages={this.fetchOlderMessages}
        loader={this.props.loader}
        fixedHeight={!!this.props.fixedHeight}
        scrollIndicator={this.props.scrollIndicator}
        fetchThreshold = {this.props.fetchThreshold || 0}
      />
    )
  }
}
