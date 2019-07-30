### React-SCL
 * Function of the package
 This package is used for only for front-end UI in the web. Currently there 
 are two components in this package `MessageList` and `MessageWindow`.
 Both components are powered by `react-virtualized` and is used for managing large message lists efficiently.
 
 `MessageListManager` uses `MessageList` to manage messages and `MessageListManager` is the component that is
 exposed to the user
 
 `MessageWindowManager` uses `MessageWindow` to manage messages and `MessageWindowManager` is the component that is
  exposed to the user
 
 Currently `MessageListManager`  is deprecated , please use `MessageWindowManager` for finer control.
 
 The props for both of these components are listed below: 
 
 Props for `MessageListManager`
 
 | props              | types                                                                                                                    |
 |--------------------|--------------------------------------------------------------------------------------------------------------------------|
 | messages           | ChannelReferencingMessage[]                                                                                              |
 | onComponentMount?  | () => void                                                                                                               |
 | onComponentUpdate? | (currentProps: object, prevProps: object) => void                                                                        |
 | producers          | Producer<ChannelReferencingMessage>[] | undefined . Array of producers which produces a view                             |
 | defaultView        | (item: ChannelReferencingMessage) => ReactElement<any>. A Default Component if none of the producers produce a view      |
 | onEndCallback      | () => void. Callback which gets called when the scroll bar reaches the top.                                              |
 | loader             | () => ReactElement<any>. A spinner component to show the user when the messages are being fetched                        |
 | isLoading          | boolean. To inform the component if the message fetching call is in flight. This tells the component to show the loader  |
 | scrollToIndex?     | number                                                                                                                   |
 
 Props for `MessageList`
 
 | props               | types                                                                                                                    |
 |---------------------|--------------------------------------------------------------------------------------------------------------------------|
 | messages            | ChannelReferencingMessage[]                                                                                              |
 | onEndCallback       | () => void. Callback which gets called when the scroll bar reaches the top.                                              |
 | getViewFromProducer | (item: ChannelReferencingMessage) => ReactElement<any>                                                                   |
 | loader              | () => ReactElement<any>. A spinner component to show the user when the messages are being fetched                        |
 | isLoading           | boolean. To inform the component if the message fetching call is in flight. This tells the component to show the loader  |
 | scrollToIndex?      | number                                                                                                                   |
 
 
 
 Props for `MessageWindowManager`
 
 | props                  | types                                                                       |
 |------------------------|-----------------------------------------------------------------------------|
 | channelId              | string                                                                      |
 | messages               | ChannelReferencingMessage[]                                                 |
 | producers              | (item: ChannelReferencingMessage) => ReactElement<any>                      |
 | fetchNewerMessages     | (channelId: string, after?: string) => Promise<ChannelReferencingMessage[]> |
 | fetchOlderMessages     | channelId: string, before?: string) => Promise<ChannelReferencingMessage[]> |
 | minRowHeight           | number                                                                      |
 | loader                 | ReactElement<any>                                                           |
 | fetchThreshold?        | number                                                                      |
 | fixedHeight?           | boolean                                                                     |
 | mitter?                | Mitter                                                                      |
 | newMessagePayloadHook? | (message: ChannelReferencingMessage) => ChannelReferencingMessage           |
 | scrollIndicator?       | (unreadCount: number, onClick: () => void) => ReactElement<any>             |
 
 Props for `MessageWindow`
 
 | props               | types                                                                       |
 |---------------------|-----------------------------------------------------------------------------|
 | initialMessages     | ChannelReferencingMessage[]                                                 |
 | getViewFromProducer | (item: ChannelReferencingMessage) => ReactElement<any>                      |
 | fetchNewerMessages  | (channelId: string, after?: string) => Promise<ChannelReferencingMessage[]> |
 | fetchOlderMessages  | channelId: string, before?: string) => Promise<ChannelReferencingMessage[]> |
 | minRowHeight        | number                                                                      |
 | loader              | ReactElement<any>                                                           |
 | fetchThreshold?     | number                                                                      |
 | fixedHeight         | boolean                                                                     |
 | scrollIndicator?    | (unreadCount: number, onClick: () => void) => ReactElement<any>             |
 
 
 ### MessageListManager (Deprecated)
  `MessageListManager` is the component exposed to the user. It uses `MessageList` to manager messages and 
  `MessageList` internally uses `React-Virtualized`. The props taken by the component is given above
  
  
 ### MessageList   (Deprecated)
  `MessageList` internally uses `React-Virtualized`. Please go through the API docs of 
    `React-Virtualized` before going through this component. The props taken by this component is given above.
    
    
   An example of this implementation is at  
   https://github.com/mitterio/mitter-web-starter/tree/with-scl
    
   
  ### MessageWindowManager
 `MessageWindowManager` is the component exposed to the user. It is complete different 
 implementation   of the MessageListManager.
 
 
 ### MessageWindow
 
 
 **On Fist Load of the component** 
 
 This component takes in an  initial set of messages(if the user has saved some messages
 in his local storage or any storage) and makes a call to get messages after the given set of 
 messages from the user or makes a call to get the latest set if the user has not provided 
 any initial set
 
 The component keeps fetching for messages till a scroll appears so that the window is scrollable.
 If the total number of messages in the channel fits in the window, the call returns an empty array
 the component terminates the fetching process   and sets `fetchTillScrollable` to false
  
  
  **On Scroll To Top and Scroll To End**
  Callbacks are triggered when the user scrolls to both end. Scrolling to top triggers a `fetchOlderMessages` call
  and scrolling to the bottom triggers a `fetchNewerMessages` call. 
  
  
  **Deduping messages**
  This component does perform a deduping operation on the initial messages that
  are given by the user and on the messages given by   `fetchOlderMessages` and
  `fetchNewerMessages`
  
  **Reason for taking channelId as a prop**
  In a web.whatsapp style layout where the chat list is on the left side and
  the active chat is on the right side of the screen, passing the active channel Id to 
  the component unmounts the `MessageWindow` and loads a new instance of
  the `MessageWindow` with new messages
     
  
 An example implementation of this component is given below
 
 ```
  <div style={{flex: 1, backgroundColor: '#f5f5f5'}}>
                     <MessageWindowManager
                         ref={this.msgManagerRef}
                         messages={this.props.queriedMessages || []} // initial messages from state containers ( redux or mobx) or from local storage
                         producers={[this.messageViewProducer]} // producers
                         defaultView={(message) => {
                             return <div
                                 style={{'borderTop': '1px solid black'}}>{message.textPayload}</div>
                         }}
                         fetchNewerMessages = {this.fetchNewerMessages}
                         fetchOlderMessages = {this.fetchOlderMessages}
                         loader={<LoaderForMsgFetch/>}
                         channelId = {this.queriedRandomChannelId}
                         minRowHeight={141}
                         fixedHeight={false}
                         newMessagePayloadHook = {channelReferencingMessageDecoder}
                         scrollIndicator={ScrollIndicator()}
                     />
                 </div>
             </div>

```
* Message View Producer Sample
```
 this.messageViewProducer = createMessageViewProducer(
            (_message) => true,
            (message) => {
                return (
                    <MessageBubble
                        message={message}
                        key={message.messageId}
                        showChannelInfo={true}
                    />
                )
            }
        )

```

```
 fetchNewerMessages = (channelId: string, after?: string) => {
         
         /** SEND INFLIGHT HERE IF REQUIRED */
         if (after) {
             this.msgPaginationManager.after = after
         }
         
         return this.msgPaginationManager.nextPage()
             .then(messages => {
                 return messages
             })
             .catch(() => {
                 return []
             })
 
     }
     fetchOlderMessages = (channelId: string, before?: string) => {
         
         /** SEND INFLIGHT HERE IF REQUIRED */
         if (before) {
             this.msgPaginationManager.before = before
         }
         
         return this.msgPaginationManager.prevPage()
             .then(messages => {
                 const messageListClone = messages.slice()
                 return messages.reverse()
             })
             .catch(() => {
                 return []
             })
     }
```


* example of a scroll indicator
```
import React from 'react'

type Props = {
    unReadCount : number
    onClick: () => void
}

class ScrollHelper extends React.Component<Props> {
    constructor(props){
        super(props)
    }

    onClickScrollIndicator = () => {
        if(this.props.onClick) {
            this.props.onClick()
        }
    }

    render() {
        return(
            <div className= "mitter-scroll-indicator-container" onClick={this.onClickScrollIndicator}>
                <div className= "mitter-scroll-indicator">
                    {
                        this.props.unReadCount  > 0 &&
                        <div className= "mitter-count-indicator">
                            {this.props.unReadCount}
                        </div>
                    }

                    <i className="material-icons mitter-down-arrow-indicator" >keyboard_arrow_down</i>
                    <i className="material-icons mitter-down-arrow-indicator">keyboard_arrow_down</i>
                </div>
            </div>
        )
    }

}


export default function ScrollIndicator() {
    return (unreadCount: number, onClick: () => void) => {
        return <ScrollHelper unReadCount={unreadCount} onClick={onClick}/>
    }
}

```

* example of new messagePayload hook
```
export const channelReferencingMessageToLowerCase = (message: ChannelReferencingMessage): ChannelReferencingMessage => {
    message.textPayload = message.textPayload.toLowerCase() 
    return message
}

```  
