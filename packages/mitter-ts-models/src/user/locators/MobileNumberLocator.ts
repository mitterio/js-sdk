import { UserLocator } from './UserLocator'

export class MobileNumberLocator extends UserLocator {
  public static LOCATOR_SERIALIZED_PREFIX: string = 'tele'

  constructor(public phoneNumber: string, userLocatorId: string) {
    super(MobileNumberLocator.LOCATOR_SERIALIZED_PREFIX, userLocatorId)
  }

  protected serializedLocator(): string {
    return this.phoneNumber
  }
}
