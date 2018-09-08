import { Mitter } from '../Mitter'

export interface GenericRequestParameters {
    data: any
    headers: { [headers: string]: string[] }
    method: string
    path: string
}

export interface GenericInterceptor {
    (mitter: Mitter, requestParameters: GenericRequestParameters): void
}
