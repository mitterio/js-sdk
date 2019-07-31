import {PickedPartial} from "@mitter-io/models";

export type TokenExpireFunction = () => void
export type MessagingPipelineConnectCb = (initSubscription: Array<string>) => void

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
}

export type MitterUserConfig = PickedPartial<MitterCoreConfig,
    "applicationId" | "weaverUrl"
    >
