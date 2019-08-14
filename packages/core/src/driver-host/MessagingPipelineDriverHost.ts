import {
    DeliveryTarget,
    WiredDeliveryTarget,
    RegisteredDeliveryTarget,
    MessageResolutionSubscription,
    predicateForSubscription,
    MessagingPipelinePayload,
    WiredMessageResolutionSubscription
} from '@mitter-io/models'

import MessagingPipelineDriver, {
    BasePipelineSink, OperatingDeliveryTargets,
    PipelineDriverSpec,
    PipelineSink
} from './../specs/MessagingPipelineDriver'
import {KvStore, Mitter, UsersClient} from '../mitter-core'
import { noOp } from '../utils'
import { AxiosError } from 'axios'
import {isIdentifier} from "rollup/dist/typings/ast/nodes/Identifier";

export type MessageSink = (payload: MessagingPipelinePayload) => void

export type onPipelineInitialiation =  (
        initSubscribedChannelIds: Array<string>,
        operatingDeliveryTarget?: OperatingDeliveryTargets,
        initialSubscription?: WiredMessageResolutionSubscription | undefined
    ) => void

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
    private operatingDeliveryTargets: OperatingDeliveryTargets

    constructor(
        pipelineDrivers: Array<MessagingPipelineDriver> | MessagingPipelineDriver,
        private mitterContext: Mitter,
        private kvStore: KvStore | undefined = undefined,
        private onAllPipelinesInitialized: (e?: any) => void = () => {},
        private onPipelineInitialization: onPipelineInitialiation
    ) {
        if (pipelineDrivers instanceof Array) {
            this.pipelineDrivers = pipelineDrivers
        } else {
            this.pipelineDrivers = [pipelineDrivers]
        }

        this.mitterContext.userAuthorizationAvailable(() => this.refresh())
        this.usersClient = this.mitterContext.clients().users()
        this.operatingDeliveryTargets = {}
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
        this.loadStoredDeliveryTargets().then(() =>
            this.initializeMessagingPipelines()
                .then(() => {
                    this.onAllPipelinesInitialized()
                })
                .catch(e => {
                    this.onAllPipelinesInitialized(e)
                })
        )
    }

    public getOperatingDeliveryTargets():OperatingDeliveryTargets {
        return this.operatingDeliveryTargets
    }

    public stop(driverName: string) {
        if(this.operatingDeliveryTargets[driverName] !== undefined) {
            // ideally delete the delivery target here
        }
        else {
            console.log('no operating delivery target found for the user,')
        }
    }

    private async loadStoredDeliveryTargets(): Promise<void> {
        this.savedDeliveryTargets = new SavedDeliveryTargets()

        if (this.kvStore === undefined) {
            console.warn(
                'You are not using a store for persisting delivery targets.' +
                    ' This might cause your users to very quickly hit provisioning limits on their targets'
            )

            return
        }

        let savedDeliveryTargets = await this.kvStore.getItem<SavedDeliveryTargets>(
            MessagingPipelineDriverHost.StoreKeys.SavedDeliveryTargets
        )
        console.log('stored delivery targets are ', savedDeliveryTargets)
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
                    'delivery Target',
                    this.savedDeliveryTargets.deliveryTargets[driverSpec.name]
                )
                preProvisionPromise = this.syncDeliveryTarget(
                    this.savedDeliveryTargets.deliveryTargets[driverSpec.name]
                )
                console.log(
                    `Found a delivery target already present for ${
                        driverSpec.name
                    }. If invalid, it will be re-provisioned`
                )
            }

            preProvisionPromise.then(syncedDeliveryTarget => {
                let operatingDeliveryTarget: Promise<DeliveryTarget | void>

                if (syncedDeliveryTarget === undefined) {
                    console.log('The delivery target on sync was determined to be invalid, refreshing')

                    operatingDeliveryTarget = driverInitialized
                        .then(() => driver.getDeliveryTarget())
                        .then(deliveryTarget => {
                            if (deliveryTarget !== undefined) {
                                console.log('delivery Target is ', deliveryTarget)
                                return this.registerDeliveryTarget(driverSpec, deliveryTarget).then(
                                    provisionedDeliveryTarget => provisionedDeliveryTarget
                                )
                            } else {
                                // return undefined
                                throw new Error('no delivery target found')
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
                        'The delivery target on sync was determined to be valid. Continuing with the same'
                    )
                    operatingDeliveryTarget = Promise.resolve(syncedDeliveryTarget)
                }

                operatingDeliveryTarget.then(deliveryTarget => {
                    if (deliveryTarget !== undefined) {
                        this.subscribeToChannels(deliveryTarget)
                            .then(wiredMessageResolutionSubscription => {
                                this.announceSinkForDriver(
                                    driver,
                                    deliveryTarget,
                                    this.generatePipelineSink(driverSpec),
                                    driverSpec.name,
                                    wiredMessageResolutionSubscription
                                )
                            })

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


    private getInitSubscribedChannelIds(initialSubscription: WiredMessageResolutionSubscription | undefined) :Array<string> {

        if(initialSubscription === undefined)
            return []
        return initialSubscription.channelIds.map(channelIdIdentifier => channelIdIdentifier.identifier)
    }

    private onStatefulPipelineInitialization(
        operatingDeliveryTarget: OperatingDeliveryTargets,
        initialSubscription: WiredMessageResolutionSubscription | undefined
    ) {

        this.onPipelineInitialization(this.getInitSubscribedChannelIds(initialSubscription), operatingDeliveryTarget, initialSubscription)
    }

    private announceSinkForDriver(
        driver: MessagingPipelineDriver,
        deliveryTarget: DeliveryTarget,
        pipelineSink: PipelineSink,
        driverName: string,
        initialSubscription: WiredMessageResolutionSubscription | undefined
    ) {
        driver.deliveryTargetRegistered(pipelineSink, deliveryTarget)
        this.onStatefulPipelineInitialization({[driverName]: deliveryTarget}, initialSubscription)
        this.operatingDeliveryTargets[driverName] = deliveryTarget

        if (driver.pipelineSinkChanged !== undefined) {
            driver.pipelineSinkChanged(pipelineSink)
        }
    }

    private syncDeliveryTarget(deliveryTarget: DeliveryTarget): Promise<DeliveryTarget | void> {
        return this.usersClient
            .getUserDeliveryTarget(deliveryTarget.deliveryTargetId)
            .then((resp: WiredDeliveryTarget) => {
                // wired delivery target extends delivery target
                delete resp.identifier
                // this.subscribeToChannels(deliveryTarget)
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

    private registerDeliveryTarget(
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

                this.syncDeliveryTargetsToStore()
                // this.subscribeToChannels(deliveryTarget)
                return deliveryTarget
            })
            .catch((resp: AxiosError) => {
                if (resp.response!.status === 409) {
                    console.log('409 received')
                    return this.usersClient.getUserDeliveryTargetByMechanismSpecification(deliveryTarget.mechanismSpecification)
                        .then((wiredDeliveryTarget) => {
                            this.savedDeliveryTargets = new SavedDeliveryTargets(
                                Object.assign({}, this.savedDeliveryTargets.deliveryTargets, {
                                    [driverSpec.name]: deliveryTarget
                                })
                            )
                            this.syncDeliveryTargetsToStore()
                            this.subscribeToChannels(deliveryTarget)
                            console.log('in getUserDeliveryTargetByMechanismSpecification', wiredDeliveryTarget)
                            return wiredDeliveryTarget as DeliveryTarget
                        })

                    /*this.savedDeliveryTargets = new SavedDeliveryTargets(
                        Object.assign({}, this.savedDeliveryTargets.deliveryTargets, {
                            [driverSpec.name]: deliveryTarget
                        })
                    )
                    this.syncDeliveryTargetsToStore()
                    this.subscribeToChannels(deliveryTarget)
                    return deliveryTarget*/
                } else {
                     throw resp
                }
            })
    }

    private syncDeliveryTargetsToStore() {
        if (this.kvStore === undefined) {
            return
        }

        this.kvStore
            .setItem(
                MessagingPipelineDriverHost.StoreKeys.SavedDeliveryTargets,
                this.savedDeliveryTargets
            )
            .catch(e => console.warn('Error syncing delivery targets to storage', e))
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

            deliveryTargetInvalidated: (deliveryTarget: DeliveryTarget) => {
                this.invalidateDeliveryTarget(driverSpec, deliveryTarget)
            },

            authorizedUserUnavailable: noOp,

            statusUpdate: noOp
        }
    }

    private invalidateDeliveryTarget(_: PipelineDriverSpec, __: DeliveryTarget) {
        throw new Error('')
    }

    private consumeNewPayload(_: PipelineDriverSpec, payload: MessagingPipelinePayload) {
        this.subscriptions.forEach(subscription => subscription(payload))
    }

    private subscribeToChannels(deliveryTarget: DeliveryTarget): Promise<WiredMessageResolutionSubscription |  undefined> {
        const channelsToSubscribe = this.mitterContext.mitterCoreConfig.initMessagingPipelineSubscriptions
        if(channelsToSubscribe.length === 0)
            return Promise.resolve(undefined)
        let subscriptionId = Date.now().toString()

        if(this.mitterContext.platformImplementedFeatures.randomIdGenerator) {
            subscriptionId = this.mitterContext.platformImplementedFeatures.randomIdGenerator()
        }

        const messageResolutionSubscription = new MessageResolutionSubscription(subscriptionId, channelsToSubscribe)
        return this.usersClient.addSubscription(deliveryTarget.deliveryTargetId, messageResolutionSubscription)
            .then((resp) => {
                if(predicateForSubscription(resp)) {
                    console.log('channels that are subscribed to ',resp.channelIds )
                    return resp
                }
            })
            .catch((resp:AxiosError) => {
                if (resp.response!.status === 409) {
                    return  ({
                        '@subscriptionType': 'message-resolution-subscription',
                        'subscriptionId': messageResolutionSubscription.subscriptionId,
                        'channelIds': messageResolutionSubscription.channelIds.map(channelId => {
                            return {identifier: channelId}
                        }),
                        'identifier': messageResolutionSubscription.subscriptionId,
                    }) as WiredMessageResolutionSubscription
                }
                return undefined
                console.log('error in subscribing to channels', resp)
            })
    }
}
