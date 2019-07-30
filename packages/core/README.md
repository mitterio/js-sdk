# mitter-core

### Core
* Function of the package

    This package is the core component of the mitter js SDK. This package exposes the mitter class 
    which acts the single point of interaction for all functions within the SDK. The user never interacts with this
    package directly , he interacts with the node, web and react-native packages with  in turn uses this package to provide
    all functionalities related to mitter
    
    
* Configs taken by the mitter object and the callback functions exposed by the object

    The following configs are passed onto the Mitter class from web, react-native or node packages
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
    
    public readonly kvStore: KvStore, - a local storage (web storage in Browser and async storage in react-native) to store delivery targets and user auth token for faster initialization
    pipelineDrivers: MessagingPipelineDriver[] | MessagingPipelineDriver, - Message Pipeline Drivers (Currently implemented drivers are fcm driver for react-native and websocker driver for web)
    globalHostObject: any, - the global object particular to the environment. Window in web and Global in react-native
    platformImplementedFeatures: PlatformImplementedFeatures, - Platform specific features .Currently implemented features are
    {
     processMultipartRequest?:
            | (<T extends BlobConfig | UriConfig>(
                  requestParams: GenericRequestParameters,
                  channelId: string,
                  message: Message,
                  fileObject: T
              ) => Promise<ChannelReferencingMessage> | Error)  // for file upload in web and react-native
        base64Decoder?: ((encodedString: string) => string), // for base-64 decoding in web and react-native
        randomIdGenerator?: () => string // for random id generation in web and react-native
    }
    ```  
    
* Mitter Api Gateway

    All requests made through the SDK goes through the Api Gateway. Basic function of the gateway
    is to intercept requests, modify the request according to the configuration passed by the Mitter Class.
    Currently it intercepts response's too , but doesn't modify it .
    
    It takes in a generic interceptor as a parameter , all the request go through this interceptor and are
    modified accordingly. You can go through the `UserAuthorizationInterceptor` for further details
    
    The mitter Api gateway is currently implemented using `axios` and its interceptor functionality
    
    
* Mitter Api Configuration

     `MitterApiConfiguration` takes in an interceptor and is passed to all the
     clients(channels client, users client, messages client etc) and the client uses this
     configuration to make API calls to mitter.
     
     Currently the generic interceptor injects in `X-Issued-Mitter-User-Authorization` and `X-Mitter-Application-Id` in react-native and web environments
      
 * Functionality of the Messaging Pipeline Driver Host and the pipeline drivers implemented by the SDK
    
    All message delivery mechanisms are implemented in web and react-native packages. The implementation of
    these mechanisms (called Drivers )are bound by the `MessagingPipelineDriver` interface .
    
    For eg: The `websocketPipelineDriver` is implemented only in the web-SDK and it follows the 
    contract laid down by `MessagingPipelineDriver` interface

    These drivers are passed onto the MitterClass as `pipelineDrivers[]`. 
    The `MessagingPipelineDriverHost` is responsible for
     
    1. Extracting valid information from the driver
    (For ex, it asks for the fcm token from the `FcmPipelineDriver`)
    
    2. Checking if a valid delivery target exists in the local storage, 
        1. if exists check delivery targets validity, if valid continue with the delivery target
        and if invalid  get a new delivery target
        
        2. If it doesn't exist get a new delivery target and save it
        
    3. Inform the pipelineDriver about the delivery target
                
    N.B: When using the websocket pipeline driver the `MessagingPipelineDriverHost` need not have to register a delivery target
    as it is created when  websocket connects for the first time

* Implementation of the kv store

    The core package expects a local storage which implements the `KvStore` interface.
    This storage is used to store userAuthTokens and delivery targets
    Web package exports an implementation of the local storage.
    React-native package exports an implmentation of the async storage
    
* Clients in mitter SDK

    Clients are mainly used to make api requests to Mitter, except in a few cases
    to get paginationMangers for channels or messages or users. 
   
    
  Users Client - To manage api requests relating to user entity
  UsersAuth Client - To manage api requests related to user authorization
  Channels Client - To manage api requests relating to channel entity
  Messages Client - To manage api requests relating to messages entity
   
  The api requests are typed using `restyped-axios`. You can refer the client classes to
  get an idea on how to add a new api
  
* Explanation of Platform Implemented Features (for implementation of functions implemented differently in different environments) and how to use it

   The need for this arose because different environments implement features differently.
   
   For eg file upload in the web-environment can be handled via `FormData`,
   but in react-native file upload is efficiently handled by `rn-fetch-blob`.
   
   So the core package expects functions that are to be overriden to be provided to it by the web or react-native
   package. If nothing is provided it falls back to the default web function
   
   Other overriden functions that are expected are
   
   1. `base64Decoder` for decoding userAuthTokens
   
    2. `randomIdGenerator` for generating random id's 
    
* Util functions in the mitter core

  1. Pagination Managers - Pagination manager implements the `PaginationInterface`. Currently there are three
  pagination managers
  1. ChannelPaginationManager - for paginating all channels in the application
  2. MessagePaginationManager - for paginating messages for a channel
  3. ParticipatedChannelsPaginationManager -  for paginating channels that the user is a participant of 
  
  
  2. Presence Builder - Util for building user Presence object
  
  3. Profile Builder - Util for building channel profiles and user profiles
