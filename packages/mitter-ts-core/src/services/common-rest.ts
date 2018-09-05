import * as rm from 'typed-rest-client/RestClient'
import { Mitter } from '../Mitter'
import { IRestResponse } from 'typed-rest-client/RestClient'

export default (mitter: Mitter) =>
    new rm.RestClient(`mitter-ts-sdk v${mitter.version()}`, mitter.mitterApiBaseUrl)

export const processRestResponse = <T>(response: IRestResponse<T>): T => {
    if (response.statusCode < 300 && response.statusCode >= 200) {
        if (response.result === null) {
            throw Error('Got a null response on a non-OK code')
        } else {
            return response.result
        }
    } else {
        throw Error('Failed network call')
    }
}
