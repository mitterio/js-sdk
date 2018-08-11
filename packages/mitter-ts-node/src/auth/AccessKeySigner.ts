import { DigestParts, DigestGenerationArtifacts } from './digest-objects'
import randomstring from 'randomstring'
import crypto from 'crypto'

export default class AccessKeySigner {
    constructor(public readonly accessKey: string, private readonly accessSecret: string) {}

    public signRequest(digestParts: DigestParts): DigestGenerationArtifacts {
        const date = this.getDate(digestParts)
        const contentType = this.getContentType(digestParts)
        const nonce = this.getNonce(digestParts)

        const computePayload = [
            digestParts.method.toUpperCase(),
            contentType,
            digestParts.payloadMd5,
            date,
            digestParts.path,
            nonce
        ].join('\n')

        const digest = crypto
            .createHmac('sha1', this.accessSecret)
            .update(computePayload)
            .digest('base64')

        return new DigestGenerationArtifacts(nonce, date, `Auth: ${this.accessKey}:${digest}`)
    }

    private getNonce(digestParts: DigestParts): string {
        if (digestParts.nonce !== undefined) {
            return digestParts.nonce
        } else {
            return randomstring.generate(32)
        }
    }

    private getContentType(digestParts: DigestParts): string {
        if (digestParts.contentType !== undefined) {
            return digestParts.contentType
        } else {
            return ''
        }
    }

    private getDate(digestParts: DigestParts): string {
        if (digestParts.date !== undefined) {
            return digestParts.date
        } else {
            return new Date().toUTCString()
        }
    }
}
