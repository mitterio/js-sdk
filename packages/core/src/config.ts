import {PickedPartial, WiredMessageResolutionSubscription} from "@mitter-io/models";
import {OperatingDeliveryTargets} from "./mitter-core";

export type TokenExpireFunction = () => void
export type MessagingPipelineConnectCb = (initSubscribedChannelIds: Array<string>, operatingDeliveryTarget?: OperatingDeliveryTargets, initialSubscription?: WiredMessageResolutionSubscription) => void
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
    mitterInstanceReady: () => void
}

export type MitterUserConfig = PickedPartial<MitterCoreConfig,
    "applicationId" | "weaverUrl"
    >
