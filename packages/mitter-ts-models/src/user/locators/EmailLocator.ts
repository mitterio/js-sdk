import UserLocator from './UserLocator'

export class EmailUserLocator extends UserLocator {
  public static LOCATOR_SERIALIZED_PREFIX: string = 'email'

  constructor(public email: string, userLocatorId: string) {
    super(EmailUserLocator.LOCATOR_SERIALIZED_PREFIX, userLocatorId)
  }

  protected serializedLocator(): string {
    return this.email
  }
}
