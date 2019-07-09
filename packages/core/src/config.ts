import {PickedPartial} from "../../models";

type TokenExpireFunction = () => void

export type MitterCoreConfig = {
    applicationId: string
    weaverUrl:string,
    mitterApiBaseUrl: string ,
    initMessagingPipelineSubscriptions: Array<string>,
    disableXHRCaching: boolean,
    mitterInstanceReady: () => void,
    onTokenExpire: TokenExpireFunction[],
    onMessagingPipelineConnectCb: (initSubscription: Array<string>) => void
}

export type MitterUserConfig = PickedPartial<MitterCoreConfig,
    "mitterApiBaseUrl" |
    "initMessagingPipelineSubscriptions" |
    "disableXHRCaching" |
    "mitterInstanceReady" |
    "onTokenExpire" |
    "onMessagingPipelineConnectCb"
    >
