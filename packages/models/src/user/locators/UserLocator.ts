import { VerificationStatus } from '../VerificationStatus'

export enum LocatorsType {
    Email = 'email',
    PhoneNumber = 'tele'
}

export enum LOCATOR_SERIALIZED_PREFIX {
    Email = 'email',
    PhoneNumber = 'tele'
}

export abstract class UserLocator {
    public verificationStatus: VerificationStatus
    public identifier: string | undefined
    public locator: string
    protected constructor(
        type: LocatorsType,
        public locatorSerializationPrefix: string,
        serializedLocator: string,
        public userLocatorId?: string,
    ) {
        (<any>this)['@type'] = type
        this.locatorSerializationPrefix = locatorSerializationPrefix
        this.verificationStatus = VerificationStatus.StatusNotProvided
        this.locator = `${this.locatorSerializationPrefix}:${serializedLocator}`
        this.identifier = this.userLocatorId
    }
}



