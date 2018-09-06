import { GenericInterceptor } from './interceptors-base'
import { StandardHeaders } from '../models/named-entities'

export const UserAuthorizationInterceptor: GenericInterceptor = async (mitter, requestParams) => {
    if (StandardHeaders.UserAuthorizationHeader! in headers) {
        const userAuthorization = await mitter.getUserAuthorization()

        if (userAuthorization !== undefined) {
            requestParams.headers[StandardHeaders.UserAuthorizationHeader] = [userAuthorization]
        }
    }
}
