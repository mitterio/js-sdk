import React, {CSSProperties, ReactElement, ReactNode, RefObject} from 'react'
import {ChannelReferencingMessage} from "../../models";
import {AutoSizer, List} from 'react-virtualized'
import {
  CellMeasurer,
  CellMeasurerCache,
  MeasuredCellParent
} from 'react-virtualized/dist/es/CellMeasurer'

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
}

export class NewMessageList extends React.Component<NewMessageListProps, NewMessageListState> {
  private cache: CellMeasurerCache
  private internalList: RefObject<List>
  private virtualizedListId: string
  private fetchTillScrollable: boolean

  constructor(props: NewMessageListProps) {
    super(props)
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: this.getRowHeight()
    })
    this.state = {
      scrollAlignment:  'end'
    }

    this.internalList =  React.createRef<List>()
    this.virtualizedListId = 'mitter-virtualized-list' + Date.now()
    this.fetchTillScrollable = false
  }

  getRowHeight({index}: { index: number | undefined } = {index: undefined}) {
    return 0
  }

  rowRenderer({key, index, parent, style}: { key: string, index: number, parent: MeasuredCellParent, style: CSSProperties }) {
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

  onScroll({clientHeight, scrollHeight, scrollTop}: { clientHeight: number, scrollHeight: number, scrollTop: number }): void {
    const messages = this.props.messages
    if(messages && messages.length > 0) {
      if(scrollTop === 0) {
        this.props.fetchOlderMessages(messages[0].messageId)
      }
      if(scrollHeight - scrollTop === clientHeight) {
        this.props.fetchNewerMessages(messages[messages.length - 1].messageId)
      }
    }
  }

  componentDidMount() {
    this.props.fetchOlderMessages()
  }

  isScrollable= (): boolean  => {
    const virtualizedList = document.getElementById(this.virtualizedListId)
    const scrollHeight = virtualizedList!.scrollHeight
    const clientHeight = virtualizedList!.clientHeight
    if(scrollHeight > clientHeight) {
      return true
    }
    return false
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
          this.props.fetchOlderMessages(messageList[0].messageId)
        }
      }

    }
    this.internalList.current!.scrollToRow(this.props.messages.length -1)
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
