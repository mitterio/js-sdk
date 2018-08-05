export enum MitterErrorCodes {
  ClaimRejected = 'claim_rejected',
  EntityNotFound = 'entity_not_found',
  AuthorizationException = 'authorization_exception',
  MissingPrivilege = 'missing_privilege',
  MissingContext = 'missing_context'
}

export type MitterErrorPreamble = {
  errorCode: string
}

export type EntityNotFoundError = MitterErrorPreamble & {
  diagnostics: {
    entityType: string
    entityLocator: string
  }
}

export type AuthorizationException = MitterErrorPreamble & {}

export type MissingPrivilegeError = MitterErrorPreamble & {
  diagnostics: {
    missingPrivileges: Array<string>
    actingEntity: string
    actor?: string
  }
}

export type MissingContextError = MitterErrorPreamble & {
  diagnostics: {
    missingContext: string
  }
}

export type ClaimRejectedError = MitterErrorPreamble & {
  diagnostics: {
    claimType: string
    claimOn: string
    claimRejectionType: string
  }
}

export type MitterError = MitterErrorPreamble &
  (EntityNotFoundError | AuthorizationException | MissingContextError | MissingPrivilegeError)
