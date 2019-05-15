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
                /*const sockJs = new SockJs(
                    `${this.mitterContext!.mitterApiBaseUrl}/v1/socket/control/sockjs`
                )*/
                // Stomp.over(sockJs)
                this.activeSocket = Stomp.over(new WebSocket('ws://172.16.92.52:7180/'))
                this.activeSocket.debug = noOp

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
                    const headers: any = {
                      'accept-version': '1.2',
                      'init-subscriptions': '/channels/open/e2zeT-Wosx8-ec2Gx-n2KvD',

                    }
                    if (this.mitterContext!.applicationId !== undefined) {
                      headers[
                            StandardHeaders.ApplicationIdHeader.toLowerCase()
                        ] = this.mitterContext!.applicationId
                    }

                    /*if(userAuthorization !== undefined) {
                      headers[
                        StandardHeaders.UserAuthorizationHeader
                        ] = userAuthorization
                    }*/

                    // headers['x-mitter-user-authorization'] = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJtaXR0ZXItaW8iLCJ1c2VyVG9rZW5JZCI6Im44YTVoV2QybHVJWTJOVUkiLCJ1c2VydG9rZW4iOiJwb25kZW5sMzByYWNkNjU2MzV0YnU3ZDZnciIsImFwcGxpY2F0aW9uSWQiOiJ3akptby10dFRLeS1rWTh3RC1yTE5rdiIsInVzZXJJZCI6IktnZTBhLWk3WVdiLTVGRHhmLXBXTEtpIn0.e1YpwZ28Nj76y7GFEDIOl6LAlN9B-j6rqTkz3IXTbaGuQ3rKyDvTtAGu3w6PGY_B1n4RVuaG0gucefaM_Qc3Pg'

                    // this.activeSocket.reconnect_delay = 1000

                    this.activeSocket.connect(
                        headers,
                        frame => {
                            this.activeSocket!!.subscribe(
                                '/',
                              (message) => {
                                  console.log('ws message',message)
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
                            setTimeout(this.connectToStream, 3000)
                        }
                    )
                    this.activeSocket.onreceive = (message => {
                      console.log('ws message1',message)
                      this.processMessage(message)
                    })
                }
            })
        }
    }
}
