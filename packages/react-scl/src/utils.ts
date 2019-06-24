import {Message} from "@mitter-io/models";
import {Identifier, ChannelReferencingMessage} from "@mitter-io/models";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export function getChannelReferencingMessage(channelId:string, message: Message): ChannelReferencingMessage {
  return new ChannelReferencingMessage(
    {identifier: channelId},
    message.messageId as string,
    message.messageType,
    message.payloadType,
    message.senderId as Identifier,
    message.textPayload,
    message.messageData,
    message.timelineEvents,
    message.entityMetadata,
    message.auditInfo,
    message.sender
)
}
