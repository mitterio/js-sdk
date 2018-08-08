import {
  MessagingPipelinePayload,
  PipelineControlPayload,
  StandardPipelinePayloadNames
} from './../mitter-models'

import { MitterError, MitterErrorCodes } from './../wire/errors'

export function fieldBasedPredicateGenerator<B, T extends B>(
  field: keyof B,
  value: any
): (target: B) => target is T {
  return (target: B): target is T => {
    return target[field] === value
  }
}

export class PayloadTypes {
  static isPipelineControl = PayloadTypes.pipelinePayloadPredicateGenerator<PipelineControlPayload>(
    StandardPipelinePayloadNames.PipelineControlPayload
  )

  static isNewChannel = PayloadTypes.pipelinePayloadPredicateGenerator<PipelineControlPayload>(
    StandardPipelinePayloadNames.NewChannelPayload
  )

  static isNewMessage = PayloadTypes.pipelinePayloadPredicateGenerator<PipelineControlPayload>(
    StandardPipelinePayloadNames.NewMessagePayload
  )

  static isNewMessageTimelineEvent = PayloadTypes.pipelinePayloadPredicateGenerator<
    PipelineControlPayload
  >(StandardPipelinePayloadNames.NewMessageTimelineEventPayload)

  static isNewChannelTimelineEvent = PayloadTypes.pipelinePayloadPredicateGenerator<
    PipelineControlPayload
  >(StandardPipelinePayloadNames.NewChannelTimelineEventPayload)

  static isParticipationChanedEvent = PayloadTypes.pipelinePayloadPredicateGenerator<
    PipelineControlPayload
  >(StandardPipelinePayloadNames.ParticipationChangedEventPayload)

  static isChannelStreamData = PayloadTypes.pipelinePayloadPredicateGenerator<
    PipelineControlPayload
  >(StandardPipelinePayloadNames.ChannelStreamData)

  private static pipelinePayloadPredicateGenerator<T extends MessagingPipelinePayload>(
    typeSpecifier: string
  ): (target: MessagingPipelinePayload) => target is T {
    return fieldBasedPredicateGenerator<MessagingPipelinePayload, T>('@type', typeSpecifier)
  }
}

export class ErrorTypes {
  static isClaimRejected = ErrorTypes.mitterErrorPayloadPredicateGenerator(
    MitterErrorCodes.ClaimRejected
  )
  static isEntityNotFound = ErrorTypes.mitterErrorPayloadPredicateGenerator(
    MitterErrorCodes.EntityNotFound
  )
  static isAuthorizationException = ErrorTypes.mitterErrorPayloadPredicateGenerator(
    MitterErrorCodes.AuthorizationException
  )
  static isMissingPrivilege = ErrorTypes.mitterErrorPayloadPredicateGenerator(
    MitterErrorCodes.MissingPrivilege
  )
  static isMissingContext = ErrorTypes.mitterErrorPayloadPredicateGenerator(
    MitterErrorCodes.MissingContext
  )

  private static mitterErrorPayloadPredicateGenerator<T extends MitterError>(
    typeSpecifier: string
  ): (target: MitterError) => target is T {
    return fieldBasedPredicateGenerator<MitterError, T>('errorCode', typeSpecifier)
  }
}
