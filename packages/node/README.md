 ### mitter-io/node
 * Function of the package
 
    Library for consuming mitter.io APIs for backend applications on node and node-like environments.
 
 * Details of accessKey signer
    
    
 * Details Api configuration provider that it implements
 
    Takes in AccessKeySigningInterceptor to intercept calls made to mitter and 
    adds in the required headers generated from the applicatiionSecret 
 
 * Details of the configuration and callback functions exposed by the package
     ```
    public mitterNodeUserConfig: MitterNodeUserConfig -  
        {
            accessKey:{
                accessKey: string,
                accessSecret: string
            }, 
            applicationId: string
            mitterApiBaseUrl?: string , // base url for mitter server
        }
    
    public mitterNodeUserHooks?: MitterNodeUserHooks, - callback functions in response to some event
        {
            onTokenExpire: TokenExpireFunction[], // an array of function to be called when a user auth token expires
                In a situation if the app has already loaded and the user has missed some messages because of a delay in the websocket connection , then this callback can be used to fetch the latest messages for the channel the user is on
            mitterInstanceReady: () => void, // to inform the user that mitter messaging pipeline  is ready . Currently not implemented 
        }
    
    ```  
 
 * Details on how it uses core package and exposes the mitter object 
 
    The Node package takes in  `mitterNodeUserConfig` and `mitterNodeUserHooks`
    and prepares default configs and passes it into the mitter Core package
     
    ```
         public mitterNodeCoreConfig: MitterNodeCoreConfig -  
                            {
                                accessKey:{
                                    accessKey: string,
                                    accessSecret: string
                                }, 
                                applicationId: string
                                mitterApiBaseUrl: string , // base url for mitter server
                            }
          public mitterUserHooks: MitterUserHooks, - callback functions in response to some event
                         {
                             onTokenExpire: TokenExpireFunction[], // an array of function to be called when a user auth token expires
                             onMessagingPipelineConnectCbs: MessagingPipelineConnectCb[], // for the time being only used for websocket connection, callback to inform the user when a websocket connection is successful for the first time
                             In a situation if the app has already loaded and the user has missed some messages because of a delay in the websocket connection , then this callback can be used to fetch the latest messages for the channel the user is on
                             mitterInstanceReady: () => void, // to inform the user that mitter messaging pipeline  is ready . Currently not implemented 
                         }
    
    ```
 
