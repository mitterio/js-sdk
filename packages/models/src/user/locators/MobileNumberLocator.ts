import {LOCATOR_SERIALIZED_PREFIX, LocatorsType, UserLocator} from "./UserLocator";
import {VerificationStatus} from "../VerificationStatus";

export interface MobileNumberLocator extends UserLocator {
    '@type':  LocatorsType.PhoneNumber
    phoneNumber: string
}

export const RequestMobileNumberLocator = (phoneNumber: string, userLocatorId: string): MobileNumberLocator => {
    return {
        '@type': LocatorsType.PhoneNumber,
        phoneNumber: phoneNumber,
        verificationStatus: VerificationStatus.StatusNotProvided,
        identifier: userLocatorId,
        userLocatorId: userLocatorId,
        locator: LOCATOR_SERIALIZED_PREFIX.PhoneNumber + phoneNumber
    }
}

