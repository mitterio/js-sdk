// tslint:disable-next-line:no-empty
import {MitterConstants, MitterCoreConfig, MitterUserConfig } from "@mitter-io/core";

export const noOp = () => {}

export function createMitterCoreConfig(mitterUserConfig: MitterUserConfig): MitterCoreConfig {
  return {
    mitterApiBaseUrl: MitterConstants.MitterApiUrl,
    initMessagingPipelineSubscriptions: [],
    disableXHRCaching:  true,
    mitterInstanceReady: () => {},
    onTokenExpire: [],
    onMessagingPipelineConnectCb: (initSubscription: Array<string>) => {noOp()},
    ...mitterUserConfig,
  }
}
