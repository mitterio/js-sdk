import {
    MessagingPipelineDriver,
    PipelineSink,
    PipelineDriverInitialization,
    Mitter,
    BasePipelineSink,
} from '@mitter-io/core'

import { DeliveryEndpoint, DeliveryTarget } from '@mitter-io/models'
import * as Stomp from '@stomp/stompjs'
import { Message } from '@stomp/stompjs'
import { noOp } from '../utils'
import WebSocketStandardHeaders from './WebSocketStandardHeaders'
import nanoid from 'nanoid'
import {
  heartbeatIncomingMs,
  heartbearOutgoingMs,
  reconnect_delay,
  webSocketInitSubscriptionsPrefix
} from "./WebSocketConstants";


export default class WebSocketPipelineDriver implements MessagingPipelineDriver {
    private activeSocket: Stomp.Client | undefined = undefined
    private pipelineSink: BasePipelineSink | undefined = undefined
    private mitterContext: Mitter | undefined = undefined
    private deliveryTargetId: string

    constructor() {
        this.connectToStream = this.connectToStream.bind(this)
        this.deliveryTargetId = nanoid()
    }

    deliveryTargetRegistered(pipelineSink: PipelineSink, userDeliveryTarget: DeliveryTarget): void {
        // Do nothing. For a driver not handling endpoints, this method will never be called
        console.warn('Assertion error. This should never be called')
    }

    getDeliveryTarget(): Promise<DeliveryTarget | undefined> {
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
                this.activeSocket = Stomp.over(new WebSocket(`${this.mitterContext!.mitterCoreConfig.weaverUrl}`))
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
                    const headers: any = {
                      [WebSocketStandardHeaders.DeliveryTargetId]: this.deliveryTargetId,
                    }

                    if (this.mitterContext!.mitterCoreConfig.applicationId !== undefined) {
                      headers[
                            WebSocketStandardHeaders.MitterApplicationId
                        ] = this.mitterContext!.mitterCoreConfig.applicationId
                    }

                   if(userAuthorization) {
                      headers[
                        WebSocketStandardHeaders.MitterUserAuthorization
                        ] = userAuthorization
                    }



                    const initSubscriptions = this.mitterContext!.mitterCoreConfig.initMessagingPipelineSubscriptions
                    const preFixedInitSubscriptions = initSubscriptions.map(channelId => {
                      return webSocketInitSubscriptionsPrefix + channelId
                    })

                    if(initSubscriptions.length > 0) {
                      headers[
                        WebSocketStandardHeaders.InitSubscriptions
                        ] = preFixedInitSubscriptions.toString()
                    }


                    this.activeSocket.connect(
                        headers,
                        frame => {
                          const connectCbs = this.mitterContext!.mitterUserCbs.onMessagingPipelineConnectCbs
                          if(connectCbs !== undefined) {
                            connectCbs.forEach(connectCb => {
                              connectCb(initSubscriptions)
                            })
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
