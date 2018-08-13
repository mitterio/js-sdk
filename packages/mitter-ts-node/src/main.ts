import AccessKeySigner from './auth/AccessKeySigner'
import http from 'http'
import md5 from 'md5'
import { DigestParts } from './auth/digest-objects'
import { IncomingMessage } from 'http'

type AccessCredentials = {
    accessKey: {
        key: string
    }
    accessSecret: {
        secret: string
    }
}

export function testFunction(accessCredential: AccessCredentials) {
    const accessKeySigner = new AccessKeySigner(
        accessCredential['accessKey']['key'],
        accessCredential['accessSecret']['secret']
    )

    const path = '/test/application/by/accesskey'
    const digestParts = new DigestParts('get', path, Buffer.from(md5(''), 'hex').toString('base64'))

    const generatedDigest = accessKeySigner.signRequest(digestParts)
    const headers = {
        Date: generatedDigest.date,
        'X-Mitter-Application-Access-Key': accessKeySigner.accessKey,
        Authorization: generatedDigest.authorizationHeader,
        Nonce: generatedDigest.nonce,
        'Content-Md5': Buffer.from(md5(''), 'hex').toString('base64')
    }

    http.request(
        {
            host: 'localhost',
            port: 8080,
            path: path,
            headers: headers
        },
        (res: IncomingMessage) => {
            let data = ''

            res.on('data', chunk => {
                data += chunk
            })

            res.on('end', () => {
                console.log(JSON.parse(data))
            })
        }
    )
        .on('error', e => {
            console.error(`Got error: ${e.message}`)
        })
        .end()
}
