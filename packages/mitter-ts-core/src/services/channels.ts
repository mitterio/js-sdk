import baseClient, { processRestResponse } from './common-rest'
import * as rm from 'typed-rest-client/RestClient'
import { Mitter } from '../Mitter'
import { Channel } from 'mitter-models'

export class MitterChannels {
    private baseClient: rm.RestClient

    constructor(private readonly mitter: Mitter) {
        this.baseClient = baseClient(mitter)
    }

    async getParticipatedChannels(userId: string): Promise<Channel[]> {
        return this.baseClient
            .get<Channel[]>(`/v1/users/${userId}/channels`)
            .then(processRestResponse)
    }
}

export default (mitter: Mitter) => new MitterChannels(mitter)
