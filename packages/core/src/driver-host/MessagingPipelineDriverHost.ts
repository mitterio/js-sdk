import { DeliveryEndpoint, MessagingPipelinePayload } from '@mitter-io/models'
import MessagingPipelineDriver, {
    BasePipelineSink,
    PipelineDriverSpec,
    PipelineSink
} from './../specs/MessagingPipelineDriver'
import {KvStore, MessagingPipelineConnectCb, Mitter, UsersClient} from '../mitter-core'
import { noOp } from '../utils'
import axios, { AxiosError, AxiosResponse } from 'axios'
import {DeliveryTarget, RegisteredDeliveryTarget} from "@mitter-io/models";
import {WiredDeliveryTarget} from "../../../models/src/weaver/DeliveryTarget/DeliveryTarget";

export type MessageSink = (payload: MessagingPipelinePayload) => void

class SavedDeliveryTargets {
    constructor(public readonly deliveryTargets: { [driver: string]: DeliveryTarget } = {}) {}
}

export class MessagingPipelineDriverHost {
    // tslint:disable-next-line:variable-name
    private static readonly StoreKeys = {
        SavedDeliveryTargets: 'savedDeliveryTargets'
    }

    private savedDeliveryTargets: SavedDeliveryTargets = new SavedDeliveryTargets()
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
        this.savedDeliveryTargets = new SavedDeliveryTargets()

        if (this.kvStore === undefined) {
            console.warn(
                'You are not using a store for persisting delivery endpoints.' +
                    ' This might cause your users to very quickly hit provisioning limits on their endpoints'
            )

            return
        }

        let savedDeliveryTargets = await this.kvStore.getItem<SavedDeliveryTargets>(
            MessagingPipelineDriverHost.StoreKeys.SavedDeliveryTargets
        )
        console.log('stored delivery endpoints are ', savedDeliveryTargets)
        if (savedDeliveryTargets !== undefined) {
            this.savedDeliveryTargets = savedDeliveryTargets
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

            let preProvisionPromise = Promise.resolve<DeliveryTarget | void>(undefined)

            if (driverSpec.name in this.savedDeliveryTargets.deliveryTargets) {
                console.log('driver', driverSpec.name)
                console.log(
                    'delivery Endpoint',
                    this.savedDeliveryTargets.deliveryTargets[driverSpec.name]
                )
                preProvisionPromise = this.syncEndpoint(
                    this.savedDeliveryTargets.deliveryTargets[driverSpec.name]
                )
                console.log(
                    `Found an endpoint already present for ${
                        driverSpec.name
                    }. If invalid, it will be re-provisioned`
                )
            }

            preProvisionPromise.then(syncedDeliveryTarget => {
                let operatingEndpoint: Promise<DeliveryTarget | void>

                if (syncedDeliveryTarget === undefined) {
                    console.log('The endpoint on sync was determined to be invalid, refreshing')

                    operatingEndpoint = driverInitialized
                        .then(() => driver.getDeliveryTarget())
                        .then(deliveryTarget => {
                            if (deliveryTarget !== undefined) {
                                console.log('delivery Endpoint is ', deliveryTarget)
                                return this.registerEndpoint(driverSpec, deliveryTarget).then(
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
                    operatingEndpoint = Promise.resolve(syncedDeliveryTarget)
                }

                operatingEndpoint.then(deliveryTarget => {
                    if (deliveryTarget !== undefined) {
                        this.announceSinkForDriver(
                            driver,
                            deliveryTarget,
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
        deliveryTarget: DeliveryTarget,
        pipelineSink: PipelineSink
    ) {
        driver.deliveryTargetRegistered(pipelineSink, deliveryTarget)

        if (driver.pipelineSinkChanged !== undefined) {
            driver.pipelineSinkChanged(pipelineSink)
        }
    }

    private syncEndpoint(deliveryTarget: DeliveryTarget): Promise<DeliveryTarget | void> {
        return this.usersClient
            .getUserDeliveryTarget(deliveryTarget.deliveryTargetId)
            .then((resp: WiredDeliveryTarget) => {
                // wired delivery target extends delivery target
                delete resp.identifier
                return resp
            })
            .catch((resp: AxiosError) => {
                if (resp.response!.status === 409) {
                    // return Promise.resolve(deliveryEndpoint)
                    return deliveryTarget
                } else {
                    return undefined
                    //  throw resp
                }
            })
    }

    private registerEndpoint(
        driverSpec: PipelineDriverSpec,
        deliveryTarget: DeliveryTarget
    ): Promise<DeliveryTarget | void> {
        return this.usersClient
            .addUserDeliveryTarget(deliveryTarget, this.mitterContext.me().identifier)
            .then((registeredTarget: RegisteredDeliveryTarget) => {
                this.savedDeliveryTargets = new SavedDeliveryTargets(
                    Object.assign({}, this.savedDeliveryTargets.deliveryTargets, {
                        [driverSpec.name]: deliveryTarget
                    })
                )

                this.syncEndpointsToStore()
                return deliveryTarget
            })
            .catch((resp: AxiosError) => {
                if (resp.response!.status === 409) {
                    this.savedDeliveryTargets = new SavedDeliveryTargets(
                        Object.assign({}, this.savedDeliveryTargets.deliveryTargets, {
                            [driverSpec.name]: deliveryTarget
                        })
                    )
                    this.syncEndpointsToStore()
                    return deliveryTarget
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
                MessagingPipelineDriverHost.StoreKeys.SavedDeliveryTargets,
                this.savedDeliveryTargets
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

            endpointInvalidated: (deliveryTarget: DeliveryTarget) => {
                this.invalidateEndpoint(driverSpec, deliveryTarget)
            },

            authorizedUserUnavailable: noOp,

            statusUpdate: noOp
        }
    }

    private invalidateEndpoint(_: PipelineDriverSpec, __: DeliveryTarget) {
        throw new Error('')
    }

    private consumeNewPayload(_: PipelineDriverSpec, payload: MessagingPipelinePayload) {
        this.subscriptions.forEach(subscription => subscription(payload))
    }
}
