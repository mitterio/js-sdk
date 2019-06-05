import {
    MessagingPipelineDriver,
    PipelineSink,
    PipelineDriverInitialization,
    Mitter,
    BasePipelineSink,
    StandardHeaders
} from '@mitter-io/core'

import { DeliveryEndpoint } from '@mitter-io/models'

// import SockJs from 'sockjs-client'
import * as Stomp from '@stomp/stompjs'
import { Message } from '@stomp/stompjs'
import { noOp } from '../utils'
import WebSocketStandardHeaders from './WebSocketStandardHeaders'
import nanoid from 'nanoid'
import {heartbeatIncomingMs, heartbearOutgoingMs, reconnect_delay} from "./WebSocketConstants";


export default class WebSocketPipelineDriver implements MessagingPipelineDriver {
    private activeSocket: Stomp.Client | undefined = undefined
    private pipelineSink: BasePipelineSink | undefined = undefined
    private connectionTime: number = 0
    private mitterContext: Mitter | undefined = undefined
    private deliveryTargetId: string

    constructor() {
        this.connectToStream = this.connectToStream.bind(this)
        this.deliveryTargetId = nanoid()
    }

    endpointRegistered(pipelineSink: PipelineSink, userDeliveryEndpoint: DeliveryEndpoint): void {
        // Do nothing. For a driver not handling endpoints, this method will never be called
        console.warn('Assertion error. This should never be called')
    }

    getDeliveryEndpoint(): Promise<DeliveryEndpoint | undefined> {
        return Promise.resolve(undefined)
    }

    halt(): void {
        noOp()
    }

    initialize(mitter: Mitter): PipelineDriverInitialization {
        this.mitterContext = mitter

        return {
            pipelineDriverSpec: {
                name: 'mitter-ws-driver'
            },

            initialized: new Promise((resolve, reject) => {
                  this.connectToStream(resolve, reject)
            })
        }
    }

    pipelineSinkChanged(pipelineSink: BasePipelineSink) {
        this.pipelineSink = pipelineSink
    }

    private processMessage(wsMessage: Message) {
        if (this.pipelineSink !== undefined) {
            this.pipelineSink.received(JSON.parse(wsMessage.body))
        }
    }

    private connectToStream(
        resolveFn?: (result: boolean) => void,
        rejectFn?: (err: Error | string) => void
    ) {
        if (this.mitterContext === undefined) {
            if (rejectFn !== undefined) {
                rejectFn(
                    Error('Cannot connect to websocket, invalid mitter context (found undefined)')
                )
            } else {
                console.warn(
                    'Cannot connect to websocket, invalid mitter context.' +
                        ' Also no error handlers were assigned to catch this error'
                )
            }
        } else {
            this.mitterContext.getUserAuthorization().then(userAuthorization => {
                // dev-box-bom1-a0.internal.mitter.io:7180
                this.activeSocket = Stomp.over(new WebSocket(`${this.mitterContext!.getWeaverUrl()}`))
                this.activeSocket.debug = noOp
                this.activeSocket.reconnect_delay = reconnect_delay
                this.activeSocket.heartbeat = {
                  incoming: heartbeatIncomingMs,
                  outgoing: heartbearOutgoingMs
                }

                let reject: (err: Error | string) => void = noOp
                let resolve: (result: boolean) => void = noOp

                if (resolveFn !== undefined) {
                    resolve = resolveFn
                }

                if (rejectFn !== undefined) {
                    reject = rejectFn
                }

                if (this.activeSocket === undefined) {
                    reject(Error('Cannot construct'))
                } else {
                    /*const authHeaders: any = {
                        [StandardHeaders.UserAuthorizationHeader]: userAuthorization
                    }*/
                    // 'x-mitter-user-authorization':'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJtaXR0ZXItaW8iLCJ1c2VyVG9rZW5JZCI6Im44YTVoV2QybHVJWTJOVUkiLCJ1c2VydG9rZW4iOiJwb25kZW5sMzByYWNkNjU2MzV0YnU3ZDZnciIsImFwcGxpY2F0aW9uSWQiOiJ3akptby10dFRLeS1rWTh3RC1yTE5rdiIsInVzZXJJZCI6IktnZTBhLWk3WVdiLTVGRHhmLXBXTEtpIn0.e1YpwZ28Nj76y7GFEDIOl6LAlN9B-j6rqTkz3IXTbaGuQ3rKyDvTtAGu3w6PGY_B1n4RVuaG0gucefaM_Qc3Pg'
                    //'init-subscriptions': '/channels/open/e2zeT-Wosx8-ec2Gx-n2KvD',

                    const headers: any = {
                      [WebSocketStandardHeaders.DeliveryTargetId]: this.deliveryTargetId,
                    }

                    if (this.mitterContext!.applicationId !== undefined) {
                      headers[
                            WebSocketStandardHeaders.MitterApplicationId
                        ] = this.mitterContext!.applicationId
                    }

                   if(userAuthorization) {
                      headers[
                        WebSocketStandardHeaders.MitterUserAuthorization
                        ] = userAuthorization
                    }



                    const initSubscriptions = this.mitterContext!.getInitMessagingPipelineSubscriptions()

                    if(initSubscriptions.length > 0) {
                      headers[
                        WebSocketStandardHeaders.InitSubscriptions
                        ] = initSubscriptions.toString()
                    }


                    this.activeSocket.connect(
                        headers,
                        frame => {
                          const connectCb = this.mitterContext!.getOnMessagingPipelineConnectCb()
                          if(connectCb !== undefined) {
                            connectCb(initSubscriptions)
                          }
                            this.activeSocket!!.subscribe(
                                '/',
                              (message) => {
                                  this.processMessage(message)
                                  message.ack()
                              },
                              {ack: 'client'}
                            )

                            resolve(true)
                        },
                        error => {
                            reject(error)
                        },
                        closeEvent => {
                            setTimeout(this.connectToStream, reconnect_delay)
                        }
                    )
                }
            })
        }
    }
}
