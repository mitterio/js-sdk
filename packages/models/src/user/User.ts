import IdentifiableEntity from '../annotations/IdentifiableEntity'
import { AuditInfo } from '../commons/common-models'
import { EntityMetadata } from '../entity/EntityMetadata'
import { AttachedProfile } from '../entity/EntityProfile'
import {UserLocator} from './locators/UserLocator';

export class User implements IdentifiableEntity<User> {
  constructor(
    public userId: string,
    public userLocators: Array<UserLocator>,
    public screenName: {
      screenName: string
    },
    public systemUser: boolean = false,
    public synthetic: boolean = false,
    public entityProfile: AttachedProfile | null = null,
    public entityMetadata: EntityMetadata = {},
    public auditInfo?: AuditInfo
) {}

  public identifier(): string {
    return this.userId
  }
}
