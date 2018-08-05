import { MitterConstants } from './constants'

export class MitterChannels {
    constructor(
        private readonly mitterApiUrl: string = MitterConstants.MitterApiUrl
    ) {}

    async getParticipatedChannels(userId: string | undefined = undefined): Promise<Response> {
        let userIdParam = (userId === undefined) ? 'me' : userId

        return await fetch(`${this.mitterApiUrl}/v1/users/${userIdParam}/channels`)
    }
}

export default new MitterChannels()
