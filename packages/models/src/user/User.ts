import IdentifiableEntity from '../annotations/IdentifiableEntity'
import { UserLocator } from './locators/UserLocator'

export class User implements IdentifiableEntity<User> {
  constructor(
    public userId: string,
    public userLocators: Array<UserLocator>,
    public screenName: {
      screenName: string
    },
    public systemUser: boolean = false,
    public synthetic: boolean = false
  ) {}

  public identifier(): string {
    return this.userId
  }
}
