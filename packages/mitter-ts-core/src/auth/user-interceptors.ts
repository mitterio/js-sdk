import { GenericInterceptor } from './interceptors-base'
import { StandardHeaders } from '../models/named-entities'

export class UserAuthorizationInterceptor {
    constructor(
        private readonly userAuthorizationFetcher: () => string | undefined,
        private readonly applicationId: string | undefined = undefined
    ) {}

    getInterceptor(): GenericInterceptor {
        return requestParams => {
            if (!(StandardHeaders.UserAuthorizationHeader in requestParams.headers)) {
                const userAuthorization = this.userAuthorizationFetcher()

                if (userAuthorization !== undefined) {
                    requestParams.headers[StandardHeaders.UserAuthorizationHeader] = [
                        userAuthorization
                    ]
                }

                if (this.applicationId !== undefined) {
                    requestParams.headers[StandardHeaders.ApplicationIdHeader] = [
                        this.applicationId
                    ]
                }
            }
        }
    }
}
