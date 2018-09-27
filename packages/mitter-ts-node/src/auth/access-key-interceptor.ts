import { GenericInterceptor, StandardHeaders } from '@mitter-io/core'
import AccessKeySigner from './AccessKeySigner'
import { AccessKeyApplicationCredentials } from './application-credentials'
import { DigestParts } from './digest-objects'
import crypto from 'crypto'

export class AccessKeySigningInterceptor {
    private readonly accessKeySigner: AccessKeySigner

    constructor(private readonly accessKeyCredentials: AccessKeyApplicationCredentials) {
        this.accessKeySigner = new AccessKeySigner(
            accessKeyCredentials.accessKey,
            accessKeyCredentials.accessSecret
        )
    }

    getInterceptor(): GenericInterceptor {
        return requestParams => {
            const payload =
                requestParams.data === null || requestParams.data === undefined
                    ? ''
                    : requestParams.data

            const wirePayload = typeof payload === 'object' ? JSON.stringify(payload) : payload
            const contentType = payload == '' ? 'null' : 'application/json'

            const payloadMd5 = crypto
                .createHash('md5')
                .update(wirePayload)
                .digest('base64')

            const digestParts = new DigestParts(
                requestParams.method,
                requestParams.path,
                payloadMd5,
                contentType
            )

            const digest = this.accessKeySigner.signRequest(digestParts)

            requestParams.headers[StandardHeaders.AccessKeyHeader] = [
                this.accessKeyCredentials.accessKey
            ]
            requestParams.headers[StandardHeaders.AccessKeyAuthorizationHeader] = [
                digest.authorizationHeader
            ]
            requestParams.headers[AccessKeySigner.Headers.Date] = [digest.date]
            requestParams.headers[AccessKeySigner.Headers.Nonce] = [digest.nonce]
            requestParams.headers[AccessKeySigner.Headers.ContentMD5] = [payloadMd5]

            if (!(contentType === null || contentType === undefined || contentType === 'null')) {
                requestParams.headers[AccessKeySigner.Headers.ContentType] = [contentType]
            }

            requestParams.data = wirePayload
        }
    }
}
