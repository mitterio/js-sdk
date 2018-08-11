import AccessKeySigner from './auth/AccessKeySigner'
import http from 'http'
import md5 from 'md5'
import { DigestParts } from './auth/digest-objects'
import { IncomingMessage } from 'http'

export function testFunction() {
    const accessKeySigner = new AccessKeySigner(
        'TV7i5qT8BmePytcH',
        'Sj4q1nmDeNHZRKSJ05PXHV68grmkLd09S6Fj71OCZ5uvJH9T4zaeNBajZgNsETNM9MaoY' +
            'y6s60actgcjssG2RgSB6T+Yl12v8KEAkv7p0ItAvb/msI+j82RqLvVxb91IT2QPKClZk+hgfzVtuHmGAR' +
            'C2oxu8fk1pdT69L5GnNWE='
    )

    console.log(md5(''))

    const path = '/test/application/by/accesskey'
    const digestParts = new DigestParts(
        'get',
        path,
        Buffer.from(md5(''), 'hex').toString('base64'),
        'application/json'
    )

    const generatedDigest = accessKeySigner.signRequest(digestParts)

    http.request(
        {
            host: 'localhost',
            port: 8080,
            path: path,
            headers: {
                'Content-Type': 'application/json',
                Date: generatedDigest.date,
                'X-Mitter-Application-Access-Key': accessKeySigner.accessKey,
                Authorization: generatedDigest.authorizationHeader,
                Nonce: generatedDigest.nonce,
                'Content-Md5': Buffer.from(md5(''), 'hex').toString('base64')
            }
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
    ).on('error', e => {
        console.error(`Got error: ${e.message}`)
    })
}
