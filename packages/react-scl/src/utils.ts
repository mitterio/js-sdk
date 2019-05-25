import {Message} from "@mitter-io/models";
import {ChannelReferencingMessage} from "@mitter-io/models";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export function getChannelReferencingMessage(channelId:string, message: Message): ChannelReferencingMessage {
  return {
    channelId: channelId,
    ...message
  }
}
