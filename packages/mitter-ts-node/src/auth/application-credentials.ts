import { MitterAccessCredentials } from 'mitter-core'

export interface MitterApplicationCredentials extends MitterAccessCredentials {}

export class AccessKeyApplicationCredentials implements MitterApplicationCredentials {
    constructor(public readonly accessKey: string, public readonly accessSecret: string) {}
}
