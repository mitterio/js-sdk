import {MitterCoreConfig, MitterUserCbs} from '@mitter-io/core'
import {AccessKeyApplicationCredentials} from "./auth/application-credentials";
import {MakeKeyPartial} from "@mitter-io/models";

export type MitterNodeCoreConfig = {accessKey: AccessKeyApplicationCredentials} &   Pick<MitterCoreConfig,
    "applicationId" | "mitterApiBaseUrl">

/** Making the mitterApiBaseUrl Id in the MitterNodeUserConfig a partial
 * as the user need not give mitterApiBaseUrl, it defaults to the mitter production url
 * */
export type MitterNodeUserConfig = MakeKeyPartial<MitterNodeCoreConfig, "mitterApiBaseUrl">


export type MitterNodeUserHooks = Pick<MitterUserCbs, "mitterInstanceReady" |"onTokenExpire">
