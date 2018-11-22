import React, { ReactElement } from 'react'
import { ChannelReferencingMessage } from '@mitter-io/models'
import MessageList from './MessageList'
import { Producer } from './Producer/Producer'
import { getViewFromProducer } from './ViewProducers/utils'

interface MessageListManagerProps {
  messages: any[]
  onComponentMount?: () =>  void
  onComponentUpdate?: (currentProps: object, prevProps: object) => void
  producers: Producer<ChannelReferencingMessage>[] | undefined
  defaultView: (item: ChannelReferencingMessage) => ReactElement<any>
  onEndCallback: () => void
  loader: () => ReactElement<any>
  isLoading: boolean
}


interface MessageListManagerState {

}

export class MessageListManager extends React.Component<MessageListManagerProps>   {

  private scrollToIndex: number = -1
  constructor(props: MessageListManagerProps) {
    super(props)
    this.getViewFromProducer = this.getViewFromProducer.bind(this)
  }

  componentWillUpdate(nextProps:MessageListManagerProps) {
    this.scrollToIndex = nextProps.messages.length - this.props.messages.length
    console.log('%c scroll to index'+ this.scrollToIndex, 'color:pink')

  }

  /*getSnapshotBeforeUpdate(prevProps: MessageListManagerProps) {
   this.scrollToIndex = this.props.messages.length - prevProps.messages.length
   console.log('%c scroll to index'+ this.scrollToIndex, 'color:pink')
 }*/

  componentDidMount() {
    if(typeof this.props.onComponentMount === 'function'){
      this.props.onComponentMount()
    }
  }

  componentDidUpdate(prevProps: MessageListManagerProps) {
    if(typeof this.props.onComponentUpdate === 'function'){
      this.props.onComponentUpdate(this.props, prevProps)
    }
  }

  getViewFromProducer(item: ChannelReferencingMessage) {
    return getViewFromProducer<ChannelReferencingMessage>(this.props.producers,item,this.props.defaultView)
  }

  render() {
    const messages =  this.props.messages.slice()
    messages.push('loading')
    return  (
      <MessageList
        onEndCallback={this.props.onEndCallback}
        messages = {this.props.messages}
        getViewFromProducer={this.getViewFromProducer}
        isLoading={this.props.isLoading}
      />
    )
  }
}
