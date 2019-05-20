import {LOCATOR_SERIALIZED_PREFIX, LocatorsType, UserLocator} from "./UserLocator"

export class EmailUserLocator extends UserLocator {

    constructor(public email: string, userLocatorId?: string) {
        super(
            LocatorsType.Email,
            LOCATOR_SERIALIZED_PREFIX.Email,
            email,
            userLocatorId,

        )

    }
}
