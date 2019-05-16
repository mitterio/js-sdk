import { VerificationStatus } from '../VerificationStatus'

export enum LocatorsType {
    Email = 'email',
    PhoneNumber = 'tele'
}

export enum LOCATOR_SERIALIZED_PREFIX {
    Email =  'email',
    PhoneNumber = 'tele'
}

export interface UserLocator {
    '@type': LocatorsType
    verificationStatus: VerificationStatus
     identifier: string
     userLocatorId: string
     locator: string
}






