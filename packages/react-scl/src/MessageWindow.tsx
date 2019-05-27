import React, {CSSProperties, ReactElement, ReactNode, RefObject} from 'react'
import {ChannelReferencingMessage} from "@mitter-io/models";
import {AutoSizer, List} from 'react-virtualized'
import {
  CellMeasurer,
  CellMeasurerCache,
  MeasuredCellParent
} from 'react-virtualized/dist/es/CellMeasurer'
import uniqBy from 'lodash/uniqBy'
import differenceBy from 'lodash/differenceBy'

type MessageWindowProps = {
  initialMessages: ChannelReferencingMessage[]
  getViewFromProducer: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (after?: string) => Promise<ChannelReferencingMessage[]>
  fetchOlderMessages: (before?: string) => Promise<ChannelReferencingMessage[]>
  minRowHeight: number
  fixedHeight: boolean
  loader: ReactElement<any>
}

type MessageWindowState = {
  scrollAlignment: 'start' | 'end' | 'center'
  showScrollHelper: boolean
  unreadCount: number
  messages: ChannelReferencingMessage[]
  isFetching: boolean
  inMountingState: boolean
}

type IndexRangeMonitor = {
  overscanStartIndex: number
  overscanStopIndex: number
  startIndex: number
  stopIndex: number
}

export default class MessageWindow extends React.Component<MessageWindowProps, MessageWindowState> {

  onNewMessagePayload = (messages: ChannelReferencingMessage[]) => {
    const clonedMessageList = this.getMessageListClone()
    const uniqueMessages = differenceBy(messages, clonedMessageList, 'messageId')
    clonedMessageList.push(...uniqueMessages)
    const scrollToRow = clonedMessageList.length
    this.setState({
      messages: clonedMessageList
    }, () => {
      this.internalList.current!.scrollToRow(scrollToRow)
      // this.internalList.current!.scrollToPosition(this.getScrollHeight())
    })
  }

  getMessageListClone = (): ChannelReferencingMessage[] => {
    return this.state.messages.slice()
  }

  getDedupedMessageList = (messageList: ChannelReferencingMessage[]): ChannelReferencingMessage[] => {
    return uniqBy(messageList, 'messageId')
  }

  getRowHeight = ({index}: { index: number | undefined } = {index: undefined}) => {
    return 0
  }

  rowRenderer = ({key, index, parent, style}: { key: string, index: number, parent: MeasuredCellParent, style: CSSProperties }) => {
    let content: ReactNode
    const messages = this.state.messages

    content = (
      <React.Fragment>
        {
          this.props.getViewFromProducer(messages[index])
        }
      </React.Fragment>
    )

    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({measure}) => (
          <div key={key} style={style} onLoad={measure}>
            {content}
          </div>
        )}
      </CellMeasurer>
    )
  }

  onScroll = ({clientHeight, scrollHeight, scrollTop}: { clientHeight: number, scrollHeight: number, scrollTop: number }): void => {
    const messages = this.state.messages
    if (!this.hasComponentMounted)
      return
    if (messages && messages.length > 0) {
      if (scrollTop === 0) {

        const firstMessage = messages[0].messageId!
        this.fetchOlderMessages(firstMessage)
      }
      if (scrollHeight - scrollTop === clientHeight) {

        const lastMessage = messages[messages.length - 1].messageId!
        this.fetchNewerMessages(lastMessage)
      }
    }
    // this.showScrollHelper()
  }

  /** CHANGE TO PROMISIFIED SET STATE*/
  fetchOlderMessages = (messageId?: string) => {

    if (!this.state.isFetching) {
      this.setState({isFetching: true}, () =>
        this.props.fetchOlderMessages(messageId)
          .then((messages: ChannelReferencingMessage[]) => {

            if (messages.length === 0) {

              this.fetchTillScrollable = false
            }

            const messageListClone = this.getMessageListClone()
            const initialMessageCount = messageListClone.length
            messageListClone.unshift(...messages)
            const dedupedMessageList = this.getDedupedMessageList(messageListClone)
            const scrollToRow = dedupedMessageList.length - initialMessageCount

            this.setState({
              messages: this.getDedupedMessageList(messageListClone),
              isFetching: false
            }, () => {
              if (!this.isScrollable() && this.fetchTillScrollable && this.state.inMountingState) {
                this.fetchOlderMessages()
              }
              else if (this.state.inMountingState && !this.fetchTillScrollable) {
                // this.internalList.current!.measureAllRows()
                // this.internalList.current!.scrollToPosition((this.internalList.current!.Grid! as any).getTotalRowsHeight())
                this.internalList.current!.scrollToRow(this.state.messages.length)
                setTimeout(() => this.setState({inMountingState: false}), 500)

              }
              else {

                this.internalList.current!.scrollToRow(scrollToRow)
              }
            })
          })
      )
    }
  }

  fetchNewerMessages = (messageId?: string) => {
    if (!this.state.isFetching && !this.state.inMountingState) {


      this.setState({isFetching: true}, () =>
        this.props.fetchNewerMessages(messageId)
          .then((messages: ChannelReferencingMessage[]) => {
            const messageListClone = this.getMessageListClone()
            const dedupedMessageList = this.getDedupedMessageList(messageListClone)
            const scrollToRow = messageListClone.length
            messageListClone.push(...messages)
            this.setState({
              messages: dedupedMessageList,
              isFetching: false
            }, () => {
              if (messages.length > 0)
                this.internalList.current!.scrollToRow(scrollToRow)
            })
          })
      )
    }
  }

  isScrollable = (): boolean => {
    const virtualizedList = document.getElementById(this.virtualizedListId)
    const scrollHeight = virtualizedList!.scrollHeight
    const clientHeight = virtualizedList!.clientHeight
    if (scrollHeight > clientHeight) {
      this.fetchTillScrollable = false
      return true
    }
    return false
  }

  getScrollHeight = (): number => {
    const virtualizedList = document.getElementById(this.virtualizedListId)
    const scrollHeight = virtualizedList!.scrollHeight
    return scrollHeight
  }

  onScrollHelperClick = () => {
    this.internalList.current!.scrollToPosition(this.getScrollHeight()) // scrolling to bottom
  }

  showScrollHelper = () => {
    const totalMessages = this.state.messages.length
    if (this.indexRangeMonitor.stopIndex < totalMessages - 3 && !this.state.showScrollHelper) {
      this.setState({showScrollHelper: true})
    }
    else if (this.indexRangeMonitor.stopIndex >= totalMessages - this.state.unreadCount && this.state.showScrollHelper) {
      this.setState({showScrollHelper: false, unreadCount: 0})
    }
  }

  private cache: CellMeasurerCache
  private internalList: RefObject<List>
  private virtualizedListId: string
  private fetchTillScrollable: boolean
  private indexRangeMonitor: IndexRangeMonitor
  private hasComponentMounted: boolean

  constructor(props: MessageWindowProps) {
    super(props)
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      fixedHeight: this.props.fixedHeight,
      minHeight: this.props.minRowHeight,
      keyMapper: (rowIndex: number, columnIndex: number) => this.state.messages[rowIndex].messageId
    })

    this.state = {
      scrollAlignment: 'end',
      showScrollHelper: false,
      unreadCount: 0,
      messages: props.initialMessages,
      isFetching: false,
      inMountingState: true
    }

    this.hasComponentMounted = false
    this.internalList = React.createRef<List>()
    this.virtualizedListId = 'mitter-virtualized-list' + Date.now()
    this.fetchTillScrollable = true
    this.indexRangeMonitor = {
      overscanStartIndex: 0,
      overscanStopIndex: 0,
      startIndex: 0,
      stopIndex: 0
    }
  }

  componentDidMount() {
    let before = undefined
    if (this.props.initialMessages.length > 0) {
      before = this.props.initialMessages[0].messageId
    }

    this.fetchOlderMessages(before)
    this.hasComponentMounted = true
  }

  componentDidUpdate(prevProps: MessageWindowProps, prevState: MessageWindowState) {
    // add checks for loading
    // if (prevState.messages && this.state.messages) {

      /*if(this.props.messages.length === prevProps.messages.length) {
        this.fetchTillScrollable = false
      }*/

      /*if (this.state.messages.length > prevState.messages.length) {
        if (!this.isScrollable() && this.fetchTillScrollable) {
          const messageList = this.state.messages

          this.fetchOlderMessages(messageList[0].messageId)
        }

        // this.scrollToPosition(this.state.messages, prevState.messages)

        if (this.state.showScrollHelper) {
          this.setState({unreadCount: this.state.messages.length - prevState.messages.length})
        }

      }*/
    // }
  }

  /* {
            this.state.showScrollHelper &&
            <ScrollHelper unreadCount={this.state.unreadCount}
                          onScrollHelperClick={this.onScrollHelperClick}/>
          }*/

  render() {
    return (
      <React.Fragment>
        {
          this.state.isFetching && this.props.loader

        }
        <AutoSizer
        >
          {({height, width}) => {
            return (
              <List
                width={width}
                id={this.virtualizedListId}
                height={height}
                ref={this.internalList}
                onRowsRendered={(
                  {overscanStartIndex, overscanStopIndex, startIndex, stopIndex}) => {
                  this.indexRangeMonitor = {
                    overscanStartIndex: overscanStartIndex,
                    overscanStopIndex: overscanStopIndex,
                    startIndex: startIndex,
                    stopIndex: stopIndex
                  }
                }
                }
                rowCount={this.state.messages.length}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRenderer}
                onScroll={this.onScroll}
                scrollToAlignment={this.state.scrollAlignment}
              />
            )
          }}
        </AutoSizer>

      </React.Fragment>
    )
  }
}
