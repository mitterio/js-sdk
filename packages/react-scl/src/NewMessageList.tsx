import React, {CSSProperties, ReactElement, ReactNode, RefObject} from 'react'
import {ChannelReferencingMessage} from "../../models";
import {AutoSizer, List} from 'react-virtualized'
import {
  CellMeasurer,
  CellMeasurerCache,
  MeasuredCellParent
} from 'react-virtualized/dist/es/CellMeasurer'
import debounce from 'lodash/debounce'

type NewMessageListProps = {
  messages: ChannelReferencingMessage[]
  getViewFromProducer: (item: ChannelReferencingMessage) => ReactElement<any>
  fetchNewerMessages: (after?: string) => void
  fetchOlderMessages: (before?: string) => void
  isFetching: boolean,
  loader: ReactElement<any>
}

type NewMessageListState = {
  scrollAlignment: 'start' | 'end' | 'center'
  showScrollHelper: boolean
}

type IndexRangeMonitor = {
  overscanStartIndex: number
  overscanStopIndex: number
  startIndex: number
  stopIndex: number
}

export class NewMessageList extends React.Component<NewMessageListProps, NewMessageListState> {
  private cache: CellMeasurerCache
  private internalList: RefObject<List>
  private virtualizedListId: string
  private fetchTillScrollable: boolean
  private debouncedFetchNewerMessages: () => void
  private indexRangeMonitor: IndexRangeMonitor

    constructor(props: NewMessageListProps) {
    super(props)
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: this.getRowHeight()
    })
    this.state = {
      scrollAlignment:  'end',
      showScrollHelper: false
    }

    this.internalList =  React.createRef<List>()
    this.virtualizedListId = 'mitter-virtualized-list' + Date.now()
    this.fetchTillScrollable = true
    this.debouncedFetchNewerMessages = debounce(this.fetchNewerMessages, 2000)
      this.indexRangeMonitor = {
        overscanStartIndex: 0,
        overscanStopIndex: 0,
        startIndex: 0,
        stopIndex: 0
      }
  }

  getRowHeight = ({index}: { index: number | undefined } = {index: undefined}) => {
    return 0
  }

  rowRenderer = ({key, index, parent, style}: { key: string, index: number, parent: MeasuredCellParent, style: CSSProperties }) =>  {
    let content: ReactNode
    const messages = this.props.messages

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
    const messages = this.props.messages
    if(messages && messages.length > 0) {
      if(scrollTop === 0) {
        console.log('fetching oldermessages from onScroll')
        this.props.fetchOlderMessages(messages[0].messageId)
      }
      if(scrollHeight - scrollTop === clientHeight) {
        console.log('fetching new messages from onScroll')
        this.debouncedFetchNewerMessages()
      }
    }
    this.showScrollHelper()
  }

  fetchNewerMessages = () => {
    const messages = this.props.messages
    this.props.fetchNewerMessages(messages[messages.length - 1].messageId)
  }

  componentDidMount() {
    console.log('fetching oldermessages from component did mount')
    this.props.fetchOlderMessages()
  }

  isScrollable = (): boolean  => {
    const virtualizedList = document.getElementById(this.virtualizedListId)
    const scrollHeight = virtualizedList!.scrollHeight
    const clientHeight = virtualizedList!.clientHeight
    if(scrollHeight > clientHeight) {
      return true
    }
    return false
  }

  getScrollHeight = (): number => {
    const virtualizedList = document.getElementById(this.virtualizedListId)
    const scrollHeight = virtualizedList!.scrollHeight
    return scrollHeight
  }


  componentDidUpdate(prevProps: NewMessageListProps) {
    // add checks for loading
    if(prevProps.messages && this.props.messages) {

      if(this.props.messages.length === prevProps.messages.length) {
        this.fetchTillScrollable = false
      }

      if(this.props.messages.length > prevProps.messages.length) {
        if (!this.isScrollable() && this.fetchTillScrollable) {
          const messageList = this.props.messages
          console.log('fetching oldermessages from component did update')
          this.props.fetchOlderMessages(messageList[0].messageId)
        }
        this.scrollToPosition(this.props.messages, prevProps.messages)

      }
    }
  }

  scrollToPosition = (currMessageList: ChannelReferencingMessage[], prevMessageList: ChannelReferencingMessage[]) => {
    if(this.fetchTillScrollable ||
      (currMessageList[currMessageList.length -1 ].messageId !== prevMessageList[prevMessageList.length -1 ].messageId)
    ) {
      this.internalList.current!.scrollToPosition(this.getScrollHeight()) // scrolling to bottom
    }
    else if(currMessageList[0].messageId !== prevMessageList[0].messageId) {
      const scrollToRow = currMessageList.length - prevMessageList.length
      this.internalList.current!.scrollToRow(scrollToRow)
    }
  }

  showScrollHelper = () => {
    const totalMessages =  this.props.messages.length
    if(this.indexRangeMonitor.stopIndex < totalMessages - 5) {
      this.setState({showScrollHelper: true})
    }
    else {
      this.setState({showScrollHelper: false})
    }
  }

  render() {
    return (
      <React.Fragment>
        {
          this.props.isFetching ?
            (
              <div style={{position: 'absolute', top: 0, left: 500}}>
                {this.props.loader}
              </div>
            )
            :
            <React.Fragment/>

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
                  { overscanStartIndex, overscanStopIndex, startIndex, stopIndex}) => {
                  onRowsRendered({startIndex, stopIndex})
                  this.monitorIndexRange({startIndex, stopIndex})
                  console.log('overscanStartIndex',overscanStartIndex)
                  console.log('overscanStopIndex',overscanStopIndex)
                  console.log('startIndex',startIndex)
                  console.log('stopIndex',stopIndex)
                  console.log('-------------------------')
                }
                }
                rowCount={this.props.messages.length}
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
