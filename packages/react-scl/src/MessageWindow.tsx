import React, {CSSProperties, ReactElement, ReactNode, RefObject} from 'react'
import {ChannelReferencingMessage} from "@mitter-io/models";
import {AutoSizer, List} from 'react-virtualized'
import {
  CellMeasurer,
  CellMeasurerCache,
  MeasuredCellParent
} from 'react-virtualized/dist/es/CellMeasurer'
import uniqBy from 'lodash/uniqBy'
import debounce from 'lodash/debounce'

type MessageWindowProps = {
  initialMessages: ChannelReferencingMessage[]
  getViewFromProducer: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (after?: string) => Promise<ChannelReferencingMessage[]>
  fetchOlderMessages: (before?: string) => Promise<ChannelReferencingMessage[]>
  minRowHeight: number
  fixedHeight: boolean
  loader: ReactElement<any>
  fetchThreshold: number
  scrollIndicator?: (unreadCount: number, onClick: () => void) => ReactElement<any>
}

type MessageWindowState = {
  scrollAlignment: 'start' | 'end' | 'center'
  showScrollIndicator: boolean
  approxUnreadCount: number
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

  private cache: CellMeasurerCache
  private internalList: RefObject<List>
  private virtualizedListId: string
  private fetchTillScrollable: boolean
  private indexRangeMonitor: IndexRangeMonitor
  private hasComponentMounted: boolean
  private debouncedScroll: (clientHeight: number, scrollHeight: number, scrollTop: number) => void
  private insideFetchThreshold: boolean =  false
  private messageIds: Array<string>


  constructor(props: MessageWindowProps) {
    super(props)
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      fixedHeight: this.props.fixedHeight,
      minHeight: this.props.minRowHeight,
      defaultHeight:this.props.minRowHeight,
      keyMapper: (rowIndex: number, columnIndex: number) => this.state.messages[rowIndex].messageId
    })

    /** deduping the initial message list provided by the user,
     *  ideally the user should dedupe it , this is just here to act as a safety net
    * */
    const dedupedInitialMessages = uniqBy(props.initialMessages, 'messageId')
    this.messageIds = this.getMessageIds(dedupedInitialMessages)
    this.state = {
      scrollAlignment: 'end',
      showScrollIndicator: false,
      approxUnreadCount: 0,
      messages: dedupedInitialMessages,
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
    this.debouncedScroll = debounce(this.onScroll, 100, {leading: true})
  }

  componentDidMount() {
    let before = undefined
    if (this.props.initialMessages.length > 0) {
      before = this.props.initialMessages[0].messageId
    }

    this.fetchOlderMessages(before)
    this.hasComponentMounted = true

    /*setInterval(() => {
      const messages = this.getMessageListClone();
      const length = messages.length;
      let randomMessageNumber =  Math.ceil(Math.random()*length)
      console.log("randomMessageNumber",randomMessageNumber);
      randomMessageNumber = randomMessageNumber -1
      const message = messages.splice(randomMessageNumber,1)
      console.log("removing", message)
      this.setState({messages: messages}, () => {
       // this.internalList.current!.measureAllRows()
        this.internalList.current!.recomputeRowHeights()
      })

    }, 1000)*/
  }

  componentDidUpdate(prevProps: MessageWindowProps, prevState: MessageWindowState) {
    /** scroll to bottom on first load as react virtualized
     * is unable to scroll to bottom due to some calculation problemts
     * within the library
     *
     * */
    if(this.state.inMountingState === false && prevState.inMountingState === true) {
      const virtualizedList = document.getElementById(this.virtualizedListId)
      if(virtualizedList) {
        virtualizedList.scrollTop = virtualizedList.scrollHeight
      }
    }
    /*if(prevState.messages.length !== this.state.messages.length) {
      this.resizeAll()
    }*/
  }

  resizeAll = () => {
    this.cache.clearAll();
    if (this.internalList.current) {
      //console.log('resixzing')
      this.internalList.current.recomputeRowHeights();
    }
  }

  getMessageIds = (messages: ChannelReferencingMessage[]) => {
    return messages.map(message => message.messageId)
  }

  /**this function exists because of the below reason
   * - there might be a delay between the call to get a delivery target and assigning a delivery target by central
   *   so there is  a possibilty that messages might get dropped, since there is no delivery target the messages might get dropped
   *   though the delay might be very small, this just acts as a safety net
   * */

  forceFetchNewerMessages = () => {
    if(this.hasComponentMounted) {
      const messages = this.state.messages
      let lastMessage = undefined
      if(messages.length > 0) {
        lastMessage = messages[messages.length - 1].messageId!
      }
      this.fetchNewerMessages(lastMessage)
    }
  }

  onNewMessagePayload = (message: ChannelReferencingMessage) => {
    if(message && this.messageIds.indexOf(message.messageId) === -1) { // DEDUPING
      const clonedMessageList = this.getMessageListClone()
      clonedMessageList.push(message)
      const scrollToRow = clonedMessageList.length
      const isScrollIndicatorVisible = this.state.showScrollIndicator
      const unreadCount = isScrollIndicatorVisible ? this.state.approxUnreadCount + 1 : 0
      this.setState({
        messages: clonedMessageList,
        approxUnreadCount:  unreadCount
      }, () => {
        /** If scroll helper is visible then the user is scrolling up to see older messages
         * , so we should not scroll to the bottom
         *  so only scroll if the scroll helper is not visible
         * */
        if(!isScrollIndicatorVisible) {
          this.setState({
            scrollAlignment: 'end'
          }, () => {
            this.internalList.current!.scrollToRow(scrollToRow)
          })
          // this.internalList.current!.scrollToRow(scrollToRow)
        }
        // this.internalList.current!.scrollToPosition(this.getScrollHeight())
      })
    }
  }

  deleteMessage = (messageId: string) => {
    console.log("react-scl message marked for deletion", messageId)
    const messages = this.getMessageListClone();
    /*const filteredMessages = messages.filter(message => {
      return message.messageId !== messageId
    })*/
    /*  find index is used instead of filter as the pipeline might send
    * duplicate copies and that is already handled
    * */
    const toBeDeletedMessageIndex = messages.findIndex(message => {
        return message.messageId === messageId
    })
    if(toBeDeletedMessageIndex >= 0) {
      messages.splice(toBeDeletedMessageIndex,1)
      this.setState({messages: messages}, () => {
        // this.internalList.current!.measureAllRows()
        console.log("react-scl message deleted", messageId)
        this.internalList.current!.recomputeRowHeights()
      })
    }
  }

  getMessageListClone = (): ChannelReferencingMessage[] => {
    return this.state.messages.slice()
  }


  getDedupedMessageList = (messageList: ChannelReferencingMessage[]): ChannelReferencingMessage[] => {
    return messageList.filter(message => {
      return this.messageIds.indexOf(message.messageId) === -1
    })
    // return uniqBy(messageList, 'messageId')
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

  onScroll = (clientHeight: number, scrollHeight: number, scrollTop: number): void => {
    const messages = this.state.messages
    if (!this.hasComponentMounted)
      return
    if (messages && messages.length > 0) {


      if (scrollTop <= this.props.fetchThreshold && !this.insideFetchThreshold) {
        const firstMessage = messages[0].messageId!
        this.insideFetchThreshold = true
        this.fetchOlderMessages(firstMessage)
        return
      }

      if(scrollTop > this.props.fetchThreshold) {
        this.insideFetchThreshold = false
      }


      /** check if user has scrolled to the botttom */
      if (scrollHeight - scrollTop === clientHeight) {

        // const lastMessage = messages[messages.length - 1].messageId!

        // this.fetchNewerMessages(lastMessage)
      }
    }
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
            const dedupedMessages = this.getDedupedMessageList(messages)
            messageListClone.unshift(...dedupedMessages)
            /**
             * though deduping is not needed here as the messages returned by the server
             * are supposed to be unique , keeping it here as  a safety net
             * */

            // const scrollToRow = messageListClone.length - initialMessageCount
            const scrollToRow = messages.length === 0 ? 0 : messages.length
            this.messageIds =  this.getMessageIds(messageListClone)

            this.setState({
              messages: messageListClone,
              isFetching: false
            }, () => {
              if (!this.isScrollable() && this.fetchTillScrollable && this.state.inMountingState) {
                this.fetchOlderMessages()
              }

              else if (this.state.inMountingState && !this.fetchTillScrollable) {
                // this.internalList.current!.measureAllRows()
                  // this.internalList.current!.recomputeRowHeights()
                  this.internalList.current!.scrollToRow(this.state.messages.length - 1)
                // this.internalList.current!.scrollToPosition(offsetForLastRow - 100)
                  setTimeout(() => this.setState({inMountingState: false}), 500)

              }

              else {
                this.setState({
                  scrollAlignment: 'start'
                }, () => {
                  this.internalList.current!.scrollToRow(scrollToRow)
                })
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
            /**
             * this is needed here as the scroll goes to the bottom on each message send,
             * and this triggers  a fetch new messages call , to prevent duplication of messages
             * as it returned by the message pipeline and from the fetch newer message call
             * */
            const dedupedMessages = this.getDedupedMessageList(messages)
            const scrollToRow = messageListClone.length
            messageListClone.push(...dedupedMessages)
            this.messageIds =  this.getMessageIds(messageListClone)

            this.setState({
              messages: messageListClone,
              isFetching: false,
            }, () => {
              if (messages.length > 0)
                this.setState({
                  scrollAlignment: 'end'
                }, () => {
                  this.internalList.current!.scrollToRow(scrollToRow)
                })
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

  onScrollIndicatorClick = () => {
    /* -1 because scrollToRow is follows Zero based numbering */
    this.setState({
      scrollAlignment: 'end'
    }, () => {
      // this.internalList.current!.scrollToRow(scrollToRow)
      this.internalList.current!.scrollToRow(this.state.messages.length - 1)
    })

  }

  showScrollIndicator = () => {
    if (this.state.isFetching || this.state.inMountingState)
      return
    const totalMessages = this.state.messages.length
    /** indexes follow Zero based numbering
     * here we are showing scroll helper only if the user has
     * scrolled upto the second last message
     */
    if (!this.state.showScrollIndicator && this.indexRangeMonitor.stopIndex < totalMessages - 2 ) {
      this.setState({showScrollIndicator: true})
    }

    else if(this.state.showScrollIndicator && this.indexRangeMonitor.stopIndex >  totalMessages - 2 ) {
      this.setState({showScrollIndicator: false, approxUnreadCount: 0 })
    }
  }



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
                deferredMeasurementCache={this.cache}
                estimatedRowSize={this.props.minRowHeight}
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
                onScroll={({ clientHeight, scrollHeight, scrollTop }: { clientHeight: number, scrollHeight: number, scrollTop: number }) => {
                  this.showScrollIndicator()
                  this.debouncedScroll(clientHeight, scrollHeight, scrollTop)
                }}
                scrollToAlignment={this.state.scrollAlignment}
              />
            )
          }}
        </AutoSizer>
        {
          this.state.showScrollIndicator &&
          this.props.scrollIndicator &&
          this.props.scrollIndicator(this.state.approxUnreadCount,  this.onScrollIndicatorClick)
        }

      </React.Fragment>
    )
  }
}
