import {
  BaseEvent,
  Application,
  Subscriber,
  User,
  Presence,
  AttributeDef,
  UserProfile
} from '../index'

import UserLocator from '../user/locators/UserLocator'
import ApplicationProperty from '../application/properties/ApplicationProperty'

export enum Central {
  NewUserEvent = 'mitter.mpe.users.NewUser',
  ScreenNameChangedEvent = 'mitter.mpe.users.ScreenNameChanged',
  UserDeletedEvent = 'mitter.mpe.users.UserDeleted',

  UserLocatorAddedEvent = 'mitter.mpe.users.UserLocatorAdded',
  UserLocatorRemovedEvent = 'mitter.mpe.users.UserLocatorRemoved',

  UserTokenIssuedEvent = 'mitter.mpe.users.UserTokenIssued',
  UserTokenRevokedEvent = 'mitter.mpe.users.UserTokenRevoked',

  UserProfileAttributeDefCreatedEvent = 'mitter.mpe.users.profiles.UserProfileAttributeDefCreatedEvent',
  UserProfileModifiedEvent = 'mitter.mpe.users.profiles.UserProfileModifiedEvent',

  UserPresenceChangedEvent = 'mitter.mpe.users.UserPresenceChanged',

  NewFederatedUserEvent = 'mitter.mpe.users.federation.NewFederatedUser',
  FederatedUserLinkStateChangedEvent = 'mitter.mpe.users.federation.FederatedUserLinkStateChanged',

  SubscriberTokenIssuedEvent = 'mitter.mpe.subscribers.SubscriberTokenIssued',
  SubscriberTokenRevokedEvent = 'mitter.mpe.subscribers.SubscriberTokenRevoked',

  NewSubscriberEvent = 'mitter.mpe.subscribers.NewSubscriber',

  TokenIssuedEvent = 'mitter.mpe.central.TokenIssuedEvent',
  TokenRevokedEvent = 'mitter.mpe.central.TokenRevokedEvent',

  NewApplicationPropertyEvent = 'mitter.mpe.applications.NewApplicationProperty',
  ApplicationPropertyDeletedEvent = 'mitter.mpe.applications.ApplicationPropertyDeleted',
  ApplicationPropertyPatchedEvent = 'mitter.mpe.applications.ApplicationPropertyPatched',

  NewApplicationEvent = 'mitter.mpe.applications.NewApplication',

  NewApplicationAccessKeyEvent = 'mitter.mpe.applications.NewApplicationAccessKey'
}

abstract class SystemEvent implements BaseEvent {}

export abstract class ApplicationEvent implements BaseEvent {
  constructor(public application: string) {}
}

abstract class SubscriberEvent implements BaseEvent {
  constructor(public subscriberId: string) {}
}

abstract class UserEvent extends ApplicationEvent {
  constructor(public userId: string, applicationId: string) {
    super(applicationId)
  }
}

export class NewUserEvent extends UserEvent {
  constructor(public user: User, applicationId: string) {
    super(user.userId, applicationId)
  }
}

export class ScreenNameChangedEvent extends UserEvent {
  constructor(
    public oldScreenName: string,
    public newScreenName: string,
    userId: string,
    applicationId: string
  ) {
    super(userId, applicationId)
  }
}

export class UserDeletedEvent extends UserEvent {
  constructor(userId: string, applicationId: string) {
    super(userId, applicationId)
  }
}

export class UserLocatorAddedEvent extends UserEvent {
  constructor(public userLocator: UserLocator, userId: string, applicationId: string) {
    super(userId, applicationId)
  }
}

export class UserLocatorRemovedEvent extends UserEvent {
  constructor(public userLocator: UserLocator, userId: string, applicationId: string) {
    super(userId, applicationId)
  }
}

export class UserTokenRevokedEvent extends UserEvent {
  constructor(public tokenId: string, userId: string, applicationId: string) {
    super(userId, applicationId)
  }
}

export class UserPresenceChangedEvent extends UserEvent {
  constructor(
    public oldPresence: Presence,
    public newPresence: Presence,
    userId: string,
    applicationId: string
  ) {
    super(userId, applicationId)
  }
}

export class UserProfileAttributeDefCreatedEvent extends ApplicationEvent {
  constructor(public attributeDef: AttributeDef, applicationId: string) {
    super(applicationId)
  }
}

export class UserProfileModifiedEvent extends UserEvent {
  constructor(public userProfile: UserProfile, applicationId: string) {
    super(userProfile.userId, applicationId)
  }
}

export class NewApplicationPropertyEvent extends ApplicationEvent {
  constructor(public applicationProperty: ApplicationProperty, applicationId: string) {
    super(applicationId)
  }
}

export class ApplicationPropertyDeletedEvent extends ApplicationEvent {
  constructor(public applicationProperty: ApplicationProperty, applicationId: string) {
    super(applicationId)
  }
}

export class ApplicationPropertyPatchedEvent extends ApplicationEvent {
  constructor(
    public applicationProperty: ApplicationProperty,
    public isDefault: boolean,
    applicationId: string
  ) {
    super(applicationId)
  }
}

export class NewApplicationEvent extends SubscriberEvent {
  constructor(public application: Application, subscriberId: string) {
    super(subscriberId)
  }
}

export class NewApplicationAccessKeyEvent extends ApplicationEvent {
  constructor(public accessKey: string, applicationId: string) {
    super(applicationId)
  }
}

export class ApplicationAccessKeyDeletedEvent extends ApplicationEvent {
  constructor(public accessKey: string, applicationId: string) {
    super(applicationId)
  }
}

export class SubscriberTokenIssuedEvent extends SubscriberEvent {
  constructor(public tokenId: string, subscriberId: string) {
    super(subscriberId)
  }
}

export class SubscriberTokenRevokedEvent extends SubscriberEvent {
  constructor(public tokenId: string, subscriberId: string) {
    super(subscriberId)
  }
}

export class NewSubscriberEvent extends SystemEvent {
  constructor(public subscriber: Subscriber) {
    super()
  }
}

export class TokenIssuedEvent extends SystemEvent {
  constructor(public tokenId: string, public entityType: string) {
    super()
  }
}

export class TokenRevokedEvent extends SystemEvent {
  constructor(public tokenId: string, public entityType: string) {
    super()
  }
}
