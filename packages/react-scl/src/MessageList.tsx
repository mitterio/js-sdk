import { ChannelReferencingMessage } from '@mitter-io/models'
import React, { CSSProperties, ReactElement, ReactNode } from 'react'
import { AutoSizer, IndexRange, InfiniteLoader, List } from 'react-virtualized'
import { MeasuredCellParent, CellMeasurer, CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer'

interface MessageListProps {
  messages: ChannelReferencingMessage[]
  onEndCallback: () => void
  getViewFromProducer: (item: ChannelReferencingMessage) => ReactElement<any>
  isLoading: boolean,
  loader: () => ReactElement<any>
  scrollToIndex: number
}

interface MessageListState {
  rowCount: number,
  scrollToIndex: number,
  isLoading: boolean
}

class MessageList extends React.PureComponent<MessageListProps> {
  private done: any
  private scrollTop: number = 0
  private _cache: CellMeasurerCache
  private _internalList: List | null = null

  constructor(props: MessageListProps) {
    super(props)
    this.state = {
      rowCount: 0,
      scrollToIndex: -1,
      isLoading: false
    }
    this._isRowLoaded = this._isRowLoaded.bind(this)
    this._loadMoreRows = this._loadMoreRows.bind(this)
    this._getRowHeight = this._getRowHeight.bind(this)
    this._rowRenderer = this._rowRenderer.bind(this)
    this._onScroll = this._onScroll.bind(this)

    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: this._getRowHeight()
    })
  }

  scrollToBottom() {
    if (this._internalList) {
      this._internalList.scrollToRow(this.props.messages.length)
    }
  }

  _onScroll({ clientHeight, scrollHeight, scrollTop }: { clientHeight: number, scrollHeight: number, scrollTop: number }): void {
    this.scrollTop = scrollTop
  }

  _isRowLoaded({ index }: { index: number }) {
    return index > 0
  }

  _rowRenderer({ key, index, parent, style }: { key: string, index: number, parent: MeasuredCellParent, style: CSSProperties }) {
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
        cache={this._cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) => (
          <div key={key} style={style} onLoad={measure}>
            { content }
          </div>
        )}
      </CellMeasurer>
    )
  }

  _loadMoreRows(params: IndexRange) {
    if (!this.props.isLoading && this.scrollTop > 0) {
      this.props.onEndCallback()
    }
    return new Promise(resolve => this.done = resolve)
  }

  _getRowHeight({ index }: { index: number | undefined } = { index: undefined }) {
    return 0
  }

  render() {
    return (
      <React.Fragment>
        {
          this.props.isLoading ?
            (
              <div style={{position: 'absolute', top:0,left:500}}>
                {this.props.loader()}
              </div>
            )
            :
            <React.Fragment/>

        }
        <InfiniteLoader
          isRowLoaded={ this._isRowLoaded }
          loadMoreRows={ this._loadMoreRows }
          rowCount={ this.props.messages.length }
          threshold={ 1 }
        >
          { ({ onRowsRendered, registerChild }) => {
            return (
              <AutoSizer
              >
                { ({ height, width }) => {
                  return (
                    <List
                      width={ width }
                      height={ height }
                      ref={ (_ref) => { this._internalList = _ref; registerChild(_ref); } }
                      onRowsRendered={ onRowsRendered }
                      rowCount={ this.props.messages.length }
                      rowHeight={ this._cache.rowHeight }
                      rowRenderer={ this._rowRenderer }
                      onScroll={this._onScroll}
                      scrollToIndex={ this.props.scrollToIndex}
                      scrollToAlignment="start"
                    />
                  )
                } }
              </AutoSizer>
            )
          } }
        </InfiniteLoader>
      </React.Fragment>
    )
  }

}

export default MessageList
