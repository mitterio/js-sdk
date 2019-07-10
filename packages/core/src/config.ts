import {PickedPartial} from "../../models";

export type TokenExpireFunction = () => void
export type MessagingPipelineConnectCb = (initSubscription: Array<string>) => void

export type MitterCoreConfig = {
    applicationId: string
    weaverUrl:string,
    mitterApiBaseUrl: string ,
    initMessagingPipelineSubscriptions: Array<string>,
    disableXHRCaching: boolean,
}

export type MitterUserHooks = {
    onTokenExpire: TokenExpireFunction[],
    onMessagingPipelineConnectCb: MessagingPipelineConnectCb[],
    mitterInstanceReady: () => void,
}

export type MitterUserConfig = PickedPartial<MitterCoreConfig,
    "applicationId"
    >
