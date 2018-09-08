import {
    MessagingPipelineDriver,
    PipelineSink,
    PipelineDriverInitialization,
    Mitter,
    BasePipelineSink
} from '../mitter-core'

import { DeliveryEndpoint } from 'mitter-models'
import { StandardHeaders } from '../mitter-core'

import SockJs from 'sockjs-client'
import * as Stomp from '@stomp/stompjs'
import { Message } from '@stomp/stompjs'

export class WebSocketPipelineDriver implements MessagingPipelineDriver {
    private activeSocket: Stomp.Client | undefined = undefined
    private pipelineSink: BasePipelineSink | undefined = undefined

    endpointRegistered(pipelineSink: PipelineSink, userDeliveryEndpoint: DeliveryEndpoint): void {
        // Do nothing. For a driver not handling endpoints, this method will never be called
        console.warn('Assertion error. This should never be called')
    }

    getDeliveryEndpoint(): Promise<DeliveryEndpoint | undefined> {
        return Promise.resolve(undefined)
    }

    halt(): void {}

    initialize(mitter: Mitter): PipelineDriverInitialization {
        const sockJs = new SockJs(`${mitter.mitterApiBaseUrl}/v1/socket/control/sockjs`)
        this.activeSocket = Stomp.over(sockJs)

        return {
            pipelineDriverSpec: {
                name: 'mitter-ws-driver'
            },

            initialized: new Promise((resolve, reject) => {
                mitter.getUserAuthorization().then(userAuthorization => {
                    if (userAuthorization === undefined || this.activeSocket === undefined) {
                        reject(Error('Cannot construct websocket without user authorization'))
                    } else {
                        const authHeaders: any = {
                            [StandardHeaders.UserAuthorizationHeader]: userAuthorization
                        }

                        if (mitter.applicationId !== undefined) {
                            authHeaders[StandardHeaders.ApplicationIdHeader] = mitter.applicationId
                        }

                        this.activeSocket.connect(authHeaders, frame => {
                            this.activeSocket!!.subscribe(
                                '/user/event-stream',
                                this.processMessage.bind(this)
                            )

                            resolve(true)
                        })
                    }
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
}
