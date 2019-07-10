import {MitterConstants, MitterUserHooks } from "@mitter-io/core";
import {MitterNodeCoreConfig, MitterNodeUserConfig, MitterNodeUserHooks} from "./config";

export const noOp = () => {}



export function getMitterNodeCoreConfig(mitterNodeUserConfig: MitterNodeUserConfig): MitterNodeCoreConfig {
    return {
        mitterApiBaseUrl: MitterConstants.MitterApiUrl,
        ...mitterNodeUserConfig,
    }
}

export function getDefaultMitterUserHooks(hooks: Partial<MitterNodeUserHooks> = {}): MitterUserHooks {
    return {
        mitterInstanceReady: () => {},
        onTokenExpire: [noOp],
        onMessagingPipelineConnectCb: [noOp],
        ...hooks
    }
}
