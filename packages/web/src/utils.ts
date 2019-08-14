// tslint:disable-next-line:no-empty
import {MitterConstants, MitterCoreConfig, MitterUserConfig, MitterUserCbs } from "@mitter-io/core";

export const noOp = () => {}

export function getMitterCoreConfig(mitterUserConfig: MitterUserConfig): MitterCoreConfig {
  return {
    mitterApiBaseUrl: MitterConstants.MitterApiUrl,
    initMessagingPipelineSubscriptions: [],
    disableXHRCaching:  true,
    ...mitterUserConfig,
  }
}


export function getDefaultMitterUserCbs(hooks: Partial<MitterUserCbs> = {}): MitterUserCbs {
  return {
    mitterInstanceReady: () => {},
    onTokenExpire: [noOp],
    onMessagingPipelineConnectCbs: [noOp],
    ...hooks
  }
}

