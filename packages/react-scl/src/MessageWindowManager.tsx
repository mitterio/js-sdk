import React, {ReactElement, RefObject} from 'react'
import {ChannelReferencingMessage} from "@mitter-io/models";
import {Producer} from './Producer/Producer'
import {getViewFromProducer} from "./ViewProducers/utils";
import MessageWindow from "./MessageWindow";
import {isNewMessagePayload, Mitter} from "@mitter-io/core";
import {getChannelReferencingMessage} from "./utils";
import Timeout = NodeJS.Timeout;


type MessageWindowManagerProps = {
  channelId: string
  messages: ChannelReferencingMessage[]
  producers: Producer<ChannelReferencingMessage>[]
  defaultView: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (channelId: string, after?: string) => Promise<ChannelReferencingMessage[]>
  fetchOlderMessages: (channelId: string, before?: string) => Promise<ChannelReferencingMessage[]>
  minRowHeight: number
  loader: ReactElement<any>
  fixedHeight?: boolean
  mitter?: Mitter
  messageThrottleRateMs? : number
  newMessagePayloadHook?: (message: ChannelReferencingMessage) => ChannelReferencingMessage
}

type MessageWindowManagerState = {
  refreshing: boolean
}

export class MessageWindowManager extends React.Component<MessageWindowManagerProps, MessageWindowManagerState> {

  private messageWindowRef: RefObject<MessageWindow>
  private throttleRateMs: number
  private messageQueue: ChannelReferencingMessage[]
  private timer: Timeout | undefined = undefined

  constructor(props: MessageWindowManagerProps) {
    super(props)
    this.state = {
      refreshing: false
    }
    this.messageWindowRef = React.createRef<MessageWindow>()
    this.throttleRateMs  = props.messageThrottleRateMs || 100
    this.messageQueue = []
  }

  componentDidMount() {
    if (this.props.mitter) {
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
              this.messageWindowRef.current!.onNewMessagePayload(message)
            })
            .catch(ex => {
              console.log('error in listening to new messages')
            })
        }
      })
    }
    this.startTimer()
  }

  componentDidUpdate(prevProps: MessageWindowManagerProps) {
    if (this.props.channelId !== prevProps.channelId && prevProps.channelId !== undefined) {
      this.refresh()
    }
  }
  componentWillMount(): void {
    if(this.timer) {
      clearInterval(this.timer)
    }
  }

  startTimer = () => {
    this.timer = setInterval(this.pushQueuedMessages , this.throttleRateMs)
  }

  pushQueuedMessages = () => {
    if(this.messageQueue.length > 0) {
      const toBeInsertedMessage = this.messageQueue.shift()
      if(toBeInsertedMessage)
        this.messageWindowRef.current!.onNewMessagePayload(toBeInsertedMessage)
    }
  }

  getViewFromProducer = (item: ChannelReferencingMessage) => {
    return getViewFromProducer<ChannelReferencingMessage>(this.props.producers, item, this.props.defaultView)
  }

  newMessagesReceived = (messages: ChannelReferencingMessage[]) => {
    // this.messageWindowRef.current!.onNewMessagePayload(message)
    this.messageQueue.push(...messages)
  }

  refresh = () => {
    this.messageQueue = []
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
      return <div>Refreshing Channel</div>
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
      />
    )
  }
}
