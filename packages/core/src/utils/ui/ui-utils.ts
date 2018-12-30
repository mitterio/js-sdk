import { Message } from '@mitter-io/models'

export function payloadTypeMatcher(payloadType: string): (message: Message) => number {
    return (message: Message): number => {
        if (message.payloadType === payloadType) {
            return 1
        } else {
            return -1
        }
    }
}
