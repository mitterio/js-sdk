// tslint:disable-next-line:no-empty
import {MitterConstants, MitterCoreConfig, MitterUserConfig, MitterUserHooks } from "@mitter-io/core";

export const noOp = () => {}

export function getMitterCoreConfig(mitterUserConfig: MitterUserConfig): MitterCoreConfig {
  return {
    mitterApiBaseUrl: MitterConstants.MitterApiUrl,
    initMessagingPipelineSubscriptions: [],
    disableXHRCaching:  true,
    ...mitterUserConfig,
  }
}


export function getDefaultMitterUserHooks(hooks: Partial<MitterUserHooks> = {}): MitterUserHooks {
  return {
    mitterInstanceReady: () => {},
    onTokenExpire: [noOp],
    onMessagingPipelineConnectCb: [noOp],
    ...hooks
  }
}

