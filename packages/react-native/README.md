### mitter-io/react-native

* Function of the package

    React Native SDK for working with mitter.io.

* Details on how it uses core package and exposes the mitter object

 React-Native SDK uses the mitter core internally to expose all the functionalities of the SDK to the user
     
 The React-Native SDK passes the user configs and callbacks along with some other configs needed by core
 and gives the user back an instance of the mitter object 
     
 below is the configuration that React-Native web SDK passes to mitter core

```
   public mitterCoreConfig: MitterCoreConfig -  
       {
           weaverUrl:string, // url for weaver
           mitterApiBaseUrl: string , // base url for mitter server
           initMessagingPipelineSubscriptions: Array<string>, // channel ids to which the user want to subscribe even if he is not a participant of that channel
           disableXHRCaching: boolean, // disable XHR mainly get request caching by the browser 
       }
   
   public mitterUserHooks: MitterUserHooks, - callback functions in response to some event
       {
           onTokenExpire: TokenExpireFunction[], // an array of function to be called when a user auth token expires
           onMessagingPipelineConnectCbs: MessagingPipelineConnectCb[], // for the time being only used for websocket connection, callback to inform the user when a websocket connection is successful for the first time
           In a situation if the app has already loaded and the user has missed some messages because of a delay in the websocket connection , then this callback can be used to fetch the latest messages for the channel the user is on
           mitterInstanceReady: () => void, // to inform the user that mitter messaging pipeline  is ready . Currently not implemented 
       }
   
   public readonly kvStore: KvStore, - implentation of local storage
   pipelineDrivers: MessagingPipelineDriver[] | MessagingPipelineDriver, - [WebSockerDriver]
   globalHostObject: any, - the global object particular to the environment. Window 
   platformImplementedFeatures: PlatformImplementedFeatures, - Platform specific features .Currently implemented features are
   {
      processMultipartRequest: nativeFileUploader, // uses rn-fetch-blob
      base64Decoder: base64.decode, // uses base-64 package
      randomIdGenerator: uuid.v4 // uses react-native-uuid
      
   }
   ```
             
  Currently using `react-native-uuid` leads to a build time error saying could not find `buffer`.
  Please do `yarn add buffer` or `npm install buffer` to resolve this error. This bug is still an open issue in
  `react-native-uuid`
  

* Details of the configuration and callback functions exposed by the package

     Listed below is the config that the user can/has to pass
```
  public mitterUserConfig: MitterUserConfig -  
      {
          weaverUrl?:string, // url for weaver
          mitterApiBaseUrl?: string , // base url for mitter server
          initMessagingPipelineSubscriptions: Array<string>, // channel ids to which the user want to subscribe even if he is not a participant of that channel
          disableXHRCaching: boolean, // disable XHR mainly get request caching by the browser , defaults to true
      }
  
  public mitterUserHooks?: MitterUserHooks, - callback functions in response to some event
      {
          onTokenExpire: TokenExpireFunction[], // an array of function to be called when a user auth token expires
          onMessagingPipelineConnectCbs: MessagingPipelineConnectCb[], // for the time being only used for websocket connection, callback to inform the user when a websocket connection is successful for the first time
          In a situation if the app has already loaded and the user has missed some messages because of a delay in the websocket connection , then this callback can be used to fetch the latest messages for the channel the user is on
          mitterInstanceReady: () => void, // to inform the user that mitter messaging pipeline  is ready . Currently not implemented 
      }
  
  ```  
  After taking the configs , the React-Native package fills in the default values if the user hasnt entered a value for any config and inject the config into the core

* Details of the messaging pipeline driver implemented by the package
    
    The React-Native package uses fcm for message delivery. The fcmDriver
    uses `react-native-firebase` package and uses the firebase SDK provided by it.
    More details can be found in the  `MitterFcmPipelineDriver` class
    
* Details of the kv Store implemented by the package

The React-Native Package implements a Kv store around react-native's async storage API

* Details of the platform Specific features implemented by the package

The React-Native Package implements
1.processMultipartRequest : uses `rn-fetch-blob` internally
2. base64Decoder: uses `base-64` npm pockage
 3. randomIdGenerator :  uses `react-native-uuid`
