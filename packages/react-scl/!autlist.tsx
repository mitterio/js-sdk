import React, { CSSProperties, ReactElement, ReactNode } from 'react'
import { AutoSizer, IndexRange, InfiniteLoader, List } from 'react-virtualized'
import { MeasuredCellParent, CellMeasurer, CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer'
import {ChannelReferencingMessage} from "@mitter-io/models";
interface AutolistProps<T> {
  items: T[],
  getNextPage: () => Promise<ChannelReferencingMessage[]>
  getPrevPage: () => Promise<ChannelReferencingMessage[]>
  getViewFromProducer: (item: T) => ReactElement<any>
  loader: ReactElement<any>
  threshold: number
}

interface AutolistState {
  isLoading: boolean
}

class SimpleAutolist<E> extends React.Component<AutolistProps<E>, AutolistState> {
  private cache: CellMeasurerCache
  private isComponentMounted: boolean
  private startOnMountFetching: boolean
  private latestPageFetched: boolean
  private startIndex: number
  private _internalList: any
  private listRef: any
  constructor(props: AutolistProps<E>) {
    super(props)
    this.state={isLoading: false}
    this.isComponentMounted = false
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: this.getRowHeight()
    })
    this._internalList = React.createRef();
    this.startOnMountFetching = true
    this.latestPageFetched = false
    this.startIndex = 0

  }

  componentDidMount(): void {
    this.isComponentMounted = true
    debugger
    this.setState({isLoading: true}, () => {
      this.props.getNextPage()
        .then(item => {
          this.setState({isLoading: false}, () => {
            if(this._internalList !== null && this._internalList.Grid !== null) {
              if(((this._internalList.Grid as any)._scrollingContainer as any).scrollHeight > ((this._internalList.Grid as any)._scrollingContainer as any).clientHeight) {
                this._internalList.scrollToRow(this.props.items.length)
                this.startOnMountFetching = false
              }
            }
          })
        })
        .catch(ex => {
          console.log('error in fetching items',ex)
        })
    })

  }

  fetchPrevRows = () => {
    this.setState({isLoading: true}, () => {
      this.props.getPrevPage()
        .then(item => {
          this.setState({isLoading: false}, () => {
            if(this._internalList !== null && this._internalList.Grid !== null && this.startOnMountFetching === true) {
              debugger
              this._internalList.scrollToRow(this.props.items.length)
              if(((this._internalList.Grid as any)._scrollingContainer as any).scrollHeight > ((this._internalList.Grid as any)._scrollingContainer as any).clientHeight) {
                this.startOnMountFetching = false
              }
              if(item.length === 0) {
                this.startOnMountFetching = false
              }
            }
            else {
              if(this._internalList !== null)
                this._internalList.scrollToRow(item.length  === 0 ? 0 : item.length - 1)
            }
          })
        })
        .catch(ex => {
          console.log('error in fetching items',ex)
        })
    })
  }

  componentDidUpdate(prevProps: Readonly<AutolistProps<E>>, prevState: Readonly<AutolistState>, snapshot?: any): void {
    if (this._internalList) {
      if(this.state.isLoading === false) {
        if((prevProps.items[prevProps.items.length - 1] && this.props.items[this.props.items.length -1])) {
          if((prevProps.items[prevProps.items.length - 1] as any).messageId !== (this.props.items[this.props.items.length - 1] as any).messageId) {
            this._internalList.scrollToRow(this.props.items.length)
          }
        }
        if(this.startOnMountFetching === true) {
          if(((this._internalList.Grid as any)._scrollingContainer as any).scrollHeight > ((this._internalList.Grid as any)._scrollingContainer as any).clientHeight) {
            this.startOnMountFetching = false
          }
          else
            this.fetchPrevRows()
        }

      }
    }
  }

  private getRowHeight = ({ index }: { index: number | undefined } = { index: undefined }) => {
    return 0
  }

  rowRenderer = ({ key, index, parent, style }: { key: string, index: number, parent: MeasuredCellParent, style: CSSProperties }) => {
    let content: ReactNode
    const items = this.props.items

    content = (
      <React.Fragment>
        {
          this.props.getViewFromProducer(items[index])
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
        {({ measure }) => (
          <div key={key} style={style} onLoad={measure}>
            { content }
          </div>
        )}
      </CellMeasurer>
    )
  }

  monitorIndexRange = (range: IndexRange) => {
    this.startIndex = range.startIndex
    /*if(this.startIndex === 0 && this.state.isLoading === false) {
      this.loadMoreRows()
    }*/
  }
  _onScroll = ({ clientHeight, scrollHeight, scrollTop }: { clientHeight: number, scrollHeight: number, scrollTop: number }): void => {
    if(scrollTop === 0 && this.state.isLoading === false && this.isComponentMounted)  {
      debugger
      this.fetchPrevRows()
    }
  }

  render() {
    const rowCount =  this.props.items.length
    return (
      <React.Fragment>
        {
          this.state.isLoading ?
            (
              <div style={{position: 'fixed', margin: 'auto'}}>
                {this.props.loader}
              </div>
            )
            :
            <React.Fragment/>

        }
        <AutoSizer>
          { ({ height, width }) => {
            return (
              <List
                width={ width }
                id={"mitter_list"}
                height={ height }
                ref={this._internalList}
                onRowsRendered={(
                  { overscanStartIndex, overscanStopIndex, startIndex, stopIndex}) => {
                  this.monitorIndexRange({startIndex, stopIndex})
                  console.log('overscanStartIndex',overscanStartIndex)
                  console.log('overscanStopIndex',overscanStopIndex)
                  console.log('startIndex',startIndex)
                  console.log('stopIndex',stopIndex)
                  console.log('-------------------------')
                }
                }
                onScroll={this._onScroll}
                rowCount={ rowCount }
                rowHeight={ this.cache.rowHeight }
                rowRenderer={ this.rowRenderer }
                scrollToAlignment={'start'}

              />
            )
          } }
        </AutoSizer>
      </React.Fragment>
    )
  }
}

export default SimpleAutolist
