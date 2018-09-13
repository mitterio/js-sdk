import IdentifiableEntity from '../../annotations/IdentifiableEntity'
import { VerificationStatus } from '../VerificationStatus'

export abstract class UserLocator implements IdentifiableEntity<UserLocator> {
  public verificationStatus: VerificationStatus

  protected constructor(public locatorSerializationPrefix: string, public userLocatorId: string) {
    this.locatorSerializationPrefix = locatorSerializationPrefix
    this.verificationStatus = VerificationStatus.StatusNotProvided
  }

  public locator(): string {
    return `${this.locatorSerializationPrefix}:${this.serializedLocator()}`
  }

  public identifier(): string {
    return this.userLocatorId
  }

  protected abstract serializedLocator(): string
}
