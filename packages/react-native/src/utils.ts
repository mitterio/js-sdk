// tslint:disable-next-line:no-empty
import {
  MitterConstants,
  MitterCoreConfig,
  MitterUserConfig,
  MitterUserHooks
} from '@mitter-io/core'

export const noOp = () => {}

export const base64ValidationRegex = new RegExp(
  /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/
)

export function getMitterCoreConfig(mitterUserConfig: MitterUserConfig): MitterCoreConfig {
  return {
    mitterApiBaseUrl: MitterConstants.MitterApiUrl,
    initMessagingPipelineSubscriptions: [],
    disableXHRCaching: true,
    ...mitterUserConfig
  }
}

export function getDefaultMitterUserHooks(hooks: Partial<MitterUserHooks> = {}): MitterUserHooks {
  return {
    mitterInstanceReady: () => {},
    onTokenExpire: [noOp],
    onMessagingPipelineConnectCbs: [noOp],
    ...hooks
  }
}
