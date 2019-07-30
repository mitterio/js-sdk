### Web
* Function of the package
  The package is to be used in web-environment to interact with mitter .
  
* Details on how it uses core package and exposes the mitter object
    Web SDK uses the mitter core internally to expose all the functionalities of the SDK to the user
     
     The web SDK passes the user configs and callbacks along with some other configs needed by core
     and gives the user back an instance of the mitter object 
     
     below is the configuration that the web SDK passes to mitter core
     
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
                 randomIdGenerator?: () => string // for random id generation in web and react-native
                 uses nano id package
             }
     ```

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
After taking the configs , the web package fills in the default values if the user hasnt entered a value for any config and inject the config into the core


* Details of the messaging pipeline driver implemented by the package

    The web package uses web Sockets for message delivery. The `webSocketDriver`
    uses Stomp internally to connect to `weaver`. More details can be found in the 
    `WebSocketMessagingPipelineDriver` class 

* Details of the kv Store implemented by the package

    The web Package implements a Kv store around `HTML5 Web Storage` 
  
* Details of the platform Specific features implemented by the package
        The web Package implements a randomIdGenerator function which is based around the nanoid package
