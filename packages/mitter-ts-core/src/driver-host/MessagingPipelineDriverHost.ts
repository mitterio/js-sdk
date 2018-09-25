import { DeliveryEndpoint, MessagingPipelinePayload } from '@mitter-io/models'
import MessagingPipelineDriver, {
    BasePipelineSink,
    PipelineDriverSpec,
    PipelineSink
} from './../specs/MessagingPipelineDriver'
import { KvStore, Mitter } from '../mitter-core'
import { noOp } from '../utils'

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
    }

    public subscribe(messageSink: MessageSink) {
        this.subscriptions.push(messageSink)
    }

    public refresh() {
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

        if (savedDeliveryEndpoints !== undefined) {
            this.savedDeliveryEndpoints = savedDeliveryEndpoints
        }
    }

    private async initializeMessagingPipelines(): Promise<any> {
        const pipelineInits: Promise<any>[] = []

        await this.pipelineDrivers.forEach(async driver => {
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
                console.log('Unable to initialize pipeline driver', ex)
                throw ex
            }

            console.log(`Initializing pipeline driver '${driverSpec.name}'`)

            let preProvisionPromise = Promise.resolve<DeliveryEndpoint | undefined>(undefined)

            if (driverSpec.name in this.savedDeliveryEndpoints.deliveryEndpoints) {
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
                let operatingEndpoint: Promise<DeliveryEndpoint | undefined>

                if (syncedEndpoint === undefined) {
                    console.log('The endpoint on sync was determined to be invalid, refreshing')

                    operatingEndpoint = driverInitialized
                        .then(() => driver.getDeliveryEndpoint())
                        .then(deliveryEndpoint => {
                            if (deliveryEndpoint !== undefined) {
                                this.registerEndpoint(driverSpec, deliveryEndpoint).then(
                                    provisionedEndpoint => provisionedEndpoint
                                )
                            } else {
                                return undefined
                            }
                        })
                        .catch(e => {
                            console.warn(
                                `Could not instantiate pipeline driver ${driverSpec.name}`,
                                e
                            )
                            throw e
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

    private async syncEndpoint(
        deliveryEndpoint: DeliveryEndpoint
    ): Promise<DeliveryEndpoint | undefined> {
        return fetch(
            `${this.mitterContext.mitterApiBaseUrl}/v1/users/me/delivery-endpoints/${
                deliveryEndpoint.serializedEndpoint
            }`
        )
            .then((resp: Response) => {
                return resp.json
            })
            .then((resp: any) => {
                return resp as DeliveryEndpoint
            })
            .catch(() => {
                return undefined
            })
    }

    private registerEndpoint(
        driverSpec: PipelineDriverSpec,
        deliveryEndpoint: DeliveryEndpoint
    ): Promise<DeliveryEndpoint> {
        return fetch(`${this.mitterContext.mitterApiBaseUrl}/v1/users/me/delivery-endpoints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deliveryEndpoint)
        })
            .then(response => response.json)
            .then((endpoint: any) => {
                this.savedDeliveryEndpoints = new SavedDeliveryEndpoints(
                    Object.assign({}, this.savedDeliveryEndpoints.deliveryEndpoints, {
                        [driverSpec.name]: endpoint
                    })
                )

                this.syncEndpointsToStore()
                console.log('returning endpoint', endpoint)
                return endpoint
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
