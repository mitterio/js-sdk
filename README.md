# mitter-io javascript SDK

Docs: [JavaScript SDK docs](https://docs.mitter.io/sdks/web)

Master repo for all js-sdk related code.

The following SDKs are available:

1. React Native
2. Web
3. node.js

The following additional packages are available:

1. Models (for typescript users)
2. React SCL (standard component library for ReactJS)

Listed below are the details of the core packages, their functionality and their dependency on each other 
Attached is a diagram which will make the dependencies clear


### Repo Setup
   The repo is setup as a mono repo using [lerna](https://github.com/lerna/lerna). 
   
   Most frequently used commands are: 
   
   `lerna bootstrap` - installs the dependencies of packages and links it internally
    
   `lerna link` - symlinks all the packages internally
   
   `lerna tag` - tags the packages with a version number for release to npm

### Setup for development

* Link packages and its dependencies

    If you haven’t done `lerna link` , you can symlink all the packages using npm link package name or yarn link package name
    
    Models -  yarn link
    Core - yarn link @mitter-io/models , then yarn link
    Web -  yarn link @mitter-io/core, yarn link @mitter-io/models , then yarn link
    Node - yarn link @mitter-io/core, yarn link @mitter-io/models , then yarn link
    React-Native - yarn link @mitter-io/core, yarn link @mitter-io/models , then yarn link
    React-SCL - yarn link @mitter-io/core, yarn link @mitter-io/models , then yarn link
    
    
   The above step is a one time setup , you need not do it again

* After modifying the sdk `lerna link`

    After modifying any package , run `yarn start` in the package and in all the packages that has it as a dependency
    For eg : if make modifications in models , run `yarn start` in core and then `yarn start` in web.
    It’s better if you do the above step in three different terminals as `yarn start`
     runs watcher, so any further changes in models will automatically reflect in core and web or in any other package that has a dependency on it 

* Setup in react-native

    At the time of writing this doc the React-native package bundler (metro-bundler) didnt 
    support sym-links . As a work around you can use this package `wml`
    You have do the following steps
    
    In core: wml add /path_to_sdk/packages/models /path_to_sdk/packages/core
    
    In web: wml add /path_to_sdk/packages/models /path_to_sdk/packages/web
            wml add /path_to_sdk/packages/core /path_to_sdk/packages/web
    
    Same as web above for react-native and node .
    
    Then type in wml start
    
    If you are testing the above packages in a project of your own then
    1. Repeat the above steps
    2. wml add /path_to_sdk/packages/models /path_to_project/node_modules/@mitter-io/models
       wml add /path_to_sdk/packages/core /path_to_project/node_modules/@mitter-io/core
       wml add /path_to_sdk/packages/web /path_to_project/node_modules/@mitter-io/web (if using the web sdk)
       wml add /path_to_sdk/packages/react-native /path_to_project/node_modules/@mitter-io/react-native (if using th react-native sdk)
       
   Then type in wml start
           

### Models

* Function of the package

  The models is named **@mitter-io/models** . This package contains the models for the entities (Users, channels and  messages) used by the mitter.io backend and the models
  for supporting messaging related functionalities .
  
  This package also contains some util functions and predicates to distinguish between the types of payload sent by the mitter.io server. 
  
  This package is used by all the other core packages(web, react-native, node and react-scl).

* How to add a new model

  Make a file named after your model that you are going to add , or a folder if you want to club in multiple models . 
  
  Usually the convention to follow  is if you have a model that the user might try to make an object of , (for eg for creating a channel , he might try to make an object out of the Channel Class model ) then it is better to make the model a class.
  
  But if the user is going to use a model just for type-checking (for eg the response received on creating a channel ) , then it is better we have it as a type or as an interface (eg: type ChannelResponse = {channelId: string})

* Adding new models as an export

  The models package exports all models in src/mitter-models.ts . Please make sure to export all the new models from here .
  Then you can run `yarn start` to get the updated code 



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

### React-Native


* Function of the package
The package is to be used in react-native-environment to interact with mitter .

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
 
 
 ### Node
 * Function of the package
    This package is used to integrate Mitter to your node backend
 
 * Details of accessKey signer
    
    
 * Details on the AccessKeySigningInterceptor and the api configuration provider that it implements
    
 
 * Details of the configuration and callback functions exposed by the package
 
 * Details on how it uses core package and exposes the mitter object 
 
 

### React-SCL
 * Function of the package
 This package is used for only for front-end UI in the web. Currently there 
 are two components in this package `MessageList` and `MessageWindow`.
 Both components are powered by `react-virtualized` and is used for managing large message lists efficiently.
 
 
 Currently `MessageList` is deprecated , please use `MessageWindow` for finer control.
 
 The props for both of these components are listed below
 