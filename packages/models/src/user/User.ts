import IdentifiableEntity from '../annotations/IdentifiableEntity'
import {MobileNumberLocator} from "./locators/MobileNumberLocator"
import {EmailUserLocator} from './locators/EmailLocator';


export class User implements IdentifiableEntity<User> {
  constructor(
    public userId: string,
    public userLocators: Array<MobileNumberLocator | EmailUserLocator>,
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
