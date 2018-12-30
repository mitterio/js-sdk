import { MitterAccessCredentials } from './credentials-base'

export interface UserCredentials extends MitterAccessCredentials {
    readonly userId: string
}

export class UserAuthorizationCredentials implements UserCredentials {
    constructor(public readonly userAuthorization: string, public readonly userId: string) {}
}
