import {MitterConstants, MitterUserCbs } from "@mitter-io/core";
import {MitterNodeCoreConfig, MitterNodeUserConfig, MitterNodeUserHooks} from "./config";

export const noOp = () => {}



export function getMitterNodeCoreConfig(mitterNodeUserConfig: MitterNodeUserConfig): MitterNodeCoreConfig {
    return {
        mitterApiBaseUrl: MitterConstants.MitterApiUrl,
        ...mitterNodeUserConfig,
    }
}

export function getDefaultMitterUserCbs(hooks: Partial<MitterNodeUserHooks> = {}): MitterUserCbs {
    return {
        mitterInstanceReady: () => {},
        onTokenExpire: [noOp],
        onMessagingPipelineConnectCbs: [noOp],
        ...hooks
    }
}
