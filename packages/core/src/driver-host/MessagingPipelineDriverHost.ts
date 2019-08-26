import { DeliveryEndpoint, MessagingPipelinePayload } from '@mitter-io/models'
import MessagingPipelineDriver, {
    BasePipelineSink,
    PipelineDriverSpec,
    PipelineSink
} from './../specs/MessagingPipelineDriver'
import {KvStore, MessagingPipelineConnectCb, Mitter, UsersClient} from '../mitter-core'
import { noOp } from '../utils'
import axios, { AxiosError, AxiosResponse } from 'axios'

export type MessageSink = (payload: MessagingPipelinePayload) => void

class SavedDeliveryEndpoints {
    constructor(public readonly deliveryEndpoints: { [driver: string]: DeliveryEndpoint } = {}) {}
}

export class MessagingPipelineDriverHost {
    // tslint:disable-next-line:variable-name
    private static readonly StoreKeys = {
        SavedDeliveryEndpoints: 'savedDeliveryEndpoints'
    }

    private savedDeliveryEndpoints: SavedDeliveryEndpoints = new SavedDeliveryEndpoints()
    private pipelineDrivers: Array<MessagingPipelineDriver>
    private subscriptions: Array<MessageSink> = []
    private usersClient: UsersClient

    constructor(
        pipelineDrivers: Array<MessagingPipelineDriver> | MessagingPipelineDriver,
        private mitterContext: Mitter,
        private kvStore: KvStore | undefined = undefined,
        private onAllPipelinesInitialized: (e?: any) => void = () => {}
    ) {
        if (pipelineDrivers instanceof Array) {
            this.pipelineDrivers = pipelineDrivers
        } else {
            this.pipelineDrivers = [pipelineDrivers]
        }

        this.mitterContext.userAuthorizationAvailable(() => this.refresh())
        this.usersClient = this.mitterContext.clients().users()
    }

    public subscribe(messageSink: MessageSink) {
        this.subscriptions.push(messageSink)
    }

    public refresh() {
        /*this.loadStoredEndpoints()
            .then(() => this.initializeMessagingPipelines())
            .then(() => {
                this.onAllPipelinesInitialized()
            })
            .catch(e => {
                this.onAllPipelinesInitialized(e)
            })*/
        this.loadStoredEndpoints().then(() =>
            this.initializeMessagingPipelines()
                .then(() => {
                    this.onAllPipelinesInitialized()
                })
                .catch(e => {
                    this.onAllPipelinesInitialized(e)
                })
        )
    }

    private async loadStoredEndpoints(): Promise<void> {
        this.savedDeliveryEndpoints = new SavedDeliveryEndpoints()

        if (this.kvStore === undefined) {
            console.warn(
                'You are not using a store for persisting delivery endpoints.' +
                    ' This might cause your users to very quickly hit provisioning limits on their endpoints'
            )

            return
        }

        let savedDeliveryEndpoints = await this.kvStore.getItem<SavedDeliveryEndpoints>(
            MessagingPipelineDriverHost.StoreKeys.SavedDeliveryEndpoints
        )
        console.log('stored delivery endpoints are ', savedDeliveryEndpoints)
        if (savedDeliveryEndpoints !== undefined) {
            this.savedDeliveryEndpoints = savedDeliveryEndpoints
        }
    }

    private async initializeMessagingPipelines(): Promise<any> {
        const pipelineInits: Promise<any>[] = []

        this.pipelineDrivers.forEach(async driver => {
            let driverInitialized: Promise<boolean | void>
            let driverSpec: PipelineDriverSpec
            try {
                let { initialized, pipelineDriverSpec } = await driver.initialize(
                    this.mitterContext
                )
                driverInitialized = initialized
                pipelineInits.push(driverInitialized)
                driverSpec = pipelineDriverSpec
            } catch (ex) {
                console.log('unable to initialize pipeline driver')
                return
            }
            console.log(`Initializing pipeline driver '${driverSpec.name}'`)

            let preProvisionPromise = Promise.resolve<DeliveryEndpoint | void>(undefined)

            if (driverSpec.name in this.savedDeliveryEndpoints.deliveryEndpoints) {
                console.log('driver', driverSpec.name)
                console.log(
                    'delivery Endpoint',
                    this.savedDeliveryEndpoints.deliveryEndpoints[driverSpec.name]
                )
                preProvisionPromise = this.syncEndpoint(
                    this.savedDeliveryEndpoints.deliveryEndpoints[driverSpec.name]
                )
                console.log(
                    `Found an endpoint already present for ${
                        driverSpec.name
                    }. If invalid, it will be re-provisioned`
                )
            }

            preProvisionPromise.then(syncedEndpoint => {
                let operatingEndpoint: Promise<DeliveryEndpoint | void>

                if (syncedEndpoint === undefined) {
                    console.log('The endpoint on sync was determined to be invalid, refreshing')

                    operatingEndpoint = driverInitialized
                        .then(() => driver.getDeliveryEndpoint())
                        .then(deliveryEndpoint => {
                            if (deliveryEndpoint !== undefined) {
                                console.log('delivery Endpoint is ', deliveryEndpoint)
                                return this.registerEndpoint(driverSpec, deliveryEndpoint).then(
                                    provisionedEndpoint => provisionedEndpoint
                                )
                            } else {
                                // return undefined
                                throw new Error('no endpoint found')
                                // return Promise.reject('no endpoint found')
                            }
                        })
                        .catch((e: any) => {
                            console.warn(
                                `Could not instantiate pipeline driver ${driverSpec.name}`,
                                e
                            )
                            // throw e
                        })
                } else {
                    console.log(
                        'The endpoint on sync was determined to be valid. Continuing with the same'
                    )
                    operatingEndpoint = Promise.resolve(syncedEndpoint)
                }

                operatingEndpoint.then(endpoint => {
                    if (endpoint !== undefined) {
                        this.announceSinkForDriver(
                            driver,
                            endpoint,
                            this.generatePipelineSink(driverSpec)
                        )
                    } else {
                        if (driver.pipelineSinkChanged !== undefined) {
                            driver.pipelineSinkChanged(
                                this.generateStatelessPipelineSink(driverSpec)
                            )
                        }
                    }
                })
            })
        })

        return Promise.all(pipelineInits)
    }

    private announceSinkForDriver(
        driver: MessagingPipelineDriver,
        endpoint: DeliveryEndpoint,
        pipelineSink: PipelineSink
    ) {
        driver.endpointRegistered(pipelineSink, endpoint)

        if (driver.pipelineSinkChanged !== undefined) {
            driver.pipelineSinkChanged(pipelineSink)
        }
    }

    private syncEndpoint(deliveryEndpoint: DeliveryEndpoint): Promise<DeliveryEndpoint | void> {
        return this.usersClient
            .getUserDeliveryEndpoint(deliveryEndpoint.serializedEndpoint)
            .then((resp: DeliveryEndpoint) => {
                return resp
            })
            .catch((resp: AxiosError) => {
                if (resp.response!.status === 409) {
                    // return Promise.resolve(deliveryEndpoint)
                    return deliveryEndpoint
                } else {
                    return undefined
                    //  throw resp
                }
            })
    }

    private registerEndpoint(
        driverSpec: PipelineDriverSpec,
        deliveryEndpoint: DeliveryEndpoint
    ): Promise<DeliveryEndpoint | void> {
        return this.usersClient
            .addUserDeliveryEndpoint(deliveryEndpoint)
            .then((endpoint: DeliveryEndpoint) => {
                this.savedDeliveryEndpoints = new SavedDeliveryEndpoints(
                    Object.assign({}, this.savedDeliveryEndpoints.deliveryEndpoints, {
                        [driverSpec.name]: endpoint
                    })
                )

                this.syncEndpointsToStore()
                return endpoint
            })
            .catch((resp: AxiosError) => {
                if (resp.response!.status === 409) {
                    this.savedDeliveryEndpoints = new SavedDeliveryEndpoints(
                        Object.assign({}, this.savedDeliveryEndpoints.deliveryEndpoints, {
                            [driverSpec.name]: deliveryEndpoint
                        })
                    )
                    this.syncEndpointsToStore()
                    return deliveryEndpoint
                } else {
                    throw resp
                }
            })
    }

    private syncEndpointsToStore() {
        if (this.kvStore === undefined) {
            return
        }

        this.kvStore
            .setItem(
                MessagingPipelineDriverHost.StoreKeys.SavedDeliveryEndpoints,
                this.savedDeliveryEndpoints
            )
            .catch(e => console.warn('Error syncing delivery endpoints to storage', e))
    }

    private generateStatelessPipelineSink(driverSpec: PipelineDriverSpec): BasePipelineSink {
        return {
            received: (payload: MessagingPipelinePayload) => {
                this.consumeNewPayload(driverSpec, payload)
            }
        }
    }

    private generatePipelineSink(driverSpec: PipelineDriverSpec): PipelineSink {
        return {
            received: (payload: MessagingPipelinePayload) => {
                this.consumeNewPayload(driverSpec, payload)
            },

            endpointInvalidated: (deliveryEndpoint: DeliveryEndpoint) => {
                this.invalidateEndpoint(driverSpec, deliveryEndpoint)
            },

            authorizedUserUnavailable: noOp,

            statusUpdate: noOp
        }
    }

    private invalidateEndpoint(_: PipelineDriverSpec, __: DeliveryEndpoint) {
        throw new Error('')
    }

    private consumeNewPayload(_: PipelineDriverSpec, payload: MessagingPipelinePayload) {
        this.subscriptions.forEach(subscription => subscription(payload))
    }
}
