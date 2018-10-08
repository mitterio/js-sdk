import {
    MessagingPipelineDriver,
    PipelineSink,
    PipelineDriverInitialization,
    Mitter,
    BasePipelineSink,
    StandardHeaders
} from '@mitter-io/core'

import { DeliveryEndpoint } from '@mitter-io/models'

import SockJs from 'sockjs-client'
import * as Stomp from '@stomp/stompjs'
import { Message } from '@stomp/stompjs'
import { noOp } from '../utils'

export default class WebSocketPipelineDriver implements MessagingPipelineDriver {
    private activeSocket: Stomp.Client | undefined = undefined
    private pipelineSink: BasePipelineSink | undefined = undefined
    private connectionTime: number = 0
    private mitterContext: Mitter | undefined = undefined

    constructor() {
        this.connectToStream = this.connectToStream.bind(this)
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
        // this.activeSocket.debug = noOp
        this.mitterContext = mitter

        return {
            pipelineDriverSpec: {
                name: 'mitter-ws-driver'
            },

            initialized: new Promise((resolve, reject) => {
                mitter.getUserAuthorization().then(userAuthorization => {
                    this.connectToStream(resolve, reject)
                })
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
                const sockJs = new SockJs(
                    `${this.mitterContext!.mitterApiBaseUrl}/v1/socket/control/sockjs`
                )
                this.activeSocket = Stomp.over(sockJs)

                let reject: (err: Error | string) => void = noOp
                let resolve: (result: boolean) => void = noOp

                if (resolveFn !== undefined) {
                    resolve = resolveFn
                }

                if (rejectFn !== undefined) {
                    reject = rejectFn
                }

                if (userAuthorization === undefined || this.activeSocket === undefined) {
                    reject(Error('Cannot construct websocket without user authorization'))
                } else {
                    const authHeaders: any = {
                        [StandardHeaders.UserAuthorizationHeader]: userAuthorization
                    }

                    if (this.mitterContext!.applicationId !== undefined) {
                        authHeaders[
                            StandardHeaders.ApplicationIdHeader
                        ] = this.mitterContext!.applicationId
                    }

                    // this.activeSocket.reconnect_delay = 1000

                    this.activeSocket.connect(
                        authHeaders,
                        frame => {
                            this.activeSocket!!.subscribe(
                                '/user/event-stream',
                                this.processMessage.bind(this)
                            )

                            resolve(true)
                        },
                        error => {
                            reject(error)
                        },
                        closeEvent => {
                            setTimeout(this.connectToStream, 500)
                        }
                    )
                }
            })
        }
    }
}
