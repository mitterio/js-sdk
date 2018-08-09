import {
    MessagingPipelineDriver,
    PipelineSink,
    PipelineDriverInitialization,
    Mitter
} from 'mitter-core'

import { DeliveryEndpoint } from 'mitter-models'

import SockJs from 'sockjs-client'
import * as Stomp from '@stomp/stompjs'
import { Message } from '@stomp/stompjs'

export class WebSocketPipelineDriver implements MessagingPipelineDriver {
    private activeSocket: Stomp.Client | undefined = undefined

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
                        throw Error('Cannot construct websocket without user authorization')
                    } else {
                        const authHeaders = {
                            'X-Issued-Mitter-User-Authorization': userAuthorization,
                            'X-Mitter-Application-Id': mitter.applicationId
                        }

                        this.activeSocket.connect(authHeaders, frame => {
                            this.activeSocket!!.subscribe('/user/event-stream', this.processMessage)
                        })
                    }
                })
            })
        }
    }

    private processMessage(wsMessage: Message) {
        console.log('Got message over WS')
    }
}
