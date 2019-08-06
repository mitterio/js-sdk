import {PickedPartial} from "@mitter-io/models";
import {OperatingDeliveryTarget} from "./mitter-core";

export type TokenExpireFunction = () => void
export type MessagingPipelineConnectCb = (initSubscription: Array<string>) => void
export type PipelineInitializationCb = (operatingDeliveryTarget: OperatingDeliveryTarget) => void

export type MitterCoreConfig = {
    applicationId: string
    weaverUrl:string,
    mitterApiBaseUrl: string ,
    initMessagingPipelineSubscriptions: Array<string>,
    disableXHRCaching: boolean,
}

export type MitterUserCbs = {
    onTokenExpire: TokenExpireFunction[],
    onMessagingPipelineConnectCbs: MessagingPipelineConnectCb[],
    mitterInstanceReady: () => void,
    pipelineInitializationCbs: PipelineInitializationCb[]
}

export type MitterUserConfig = PickedPartial<MitterCoreConfig,
    "applicationId" | "weaverUrl"
    >
