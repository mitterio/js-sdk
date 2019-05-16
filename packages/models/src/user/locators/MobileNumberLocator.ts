import {LOCATOR_SERIALIZED_PREFIX, LocatorsType, UserLocator} from "./UserLocator";

export class MobileNumberLocator extends UserLocator {

    constructor(public phoneNumber: string, userLocatorId: string) {
        super(
            LocatorsType.PhoneNumber,
            LOCATOR_SERIALIZED_PREFIX.PhoneNumber,
            phoneNumber,
            userLocatorId
        )
    }
}
