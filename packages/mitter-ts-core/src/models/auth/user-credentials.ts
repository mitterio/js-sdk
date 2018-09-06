import { MitterAccessCredentials } from './credentials-base'
import { MitterApplicationCredentials } from './application-credentials'

export interface UserCredentials extends MitterAccessCredentials {
    readonly userId: string
}

export class UserAuthorizationCredentials implements UserCredentials {
    constructor(public readonly userAuthorization: string, public readonly userId: string) {}
}

export class SudoUserCredentials implements UserCredentials {
    constructor(
        public readonly userId: string,
        public readonly applicationCredentials: MitterApplicationCredentials
    ) {}
}
