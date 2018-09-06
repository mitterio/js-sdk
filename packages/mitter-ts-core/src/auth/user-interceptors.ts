import { GenericInterceptor } from './interceptors-base'
import { StandardHeaders } from '../models/named-entities'

export const UserAuthorizationInterceptor: GenericInterceptor = async (mitter, data, headers) => {
    if (StandardHeaders.UserAuthorizationHeader! in headers) {
        const userAuthorization = await mitter.getUserAuthorization()

        if (userAuthorization !== undefined) {
            headers[StandardHeaders.UserAuthorizationHeader] = [userAuthorization]
        }
    }
}
