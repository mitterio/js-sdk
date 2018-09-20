import IdentifiableEntity from '../annotations/IdentifiableEntity'
import { UserLocator } from './locators/UserLocator'

export class User implements IdentifiableEntity<User> {
  constructor(
    public userId: string,
    public userLocators: Array<UserLocator>,
    public systemUser: boolean,
    public synthetic: boolean = false,
    public screenName: {
      screenName: string
    }
  ) {}

  public identifier(): string {
    return this.userId
  }
}
