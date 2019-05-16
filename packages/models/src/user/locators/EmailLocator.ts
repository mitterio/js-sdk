import {VerificationStatus} from "../VerificationStatus";
import {LOCATOR_SERIALIZED_PREFIX, LocatorsType, UserLocator} from "./UserLocator";


export interface EmailUserLocator extends UserLocator {
    '@type': LocatorsType.Email
    email: string
}

export const RequestEmailUserLocator = (email: string, userLocatorId: string): EmailUserLocator => {
    return( {
        '@type': LocatorsType.Email,
        email: email,
        verificationStatus: VerificationStatus.StatusNotProvided,
        identifier: userLocatorId,
        userLocatorId: userLocatorId,
        locator: LOCATOR_SERIALIZED_PREFIX.Email + email
    })
}
