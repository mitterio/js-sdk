import { Mitter } from '../Mitter'

export interface GenericRequestParameters {
    data: any
    headers: { [headers: string]: string[] }
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    url: string
}

export interface GenericInterceptor {
    (mitter: Mitter, requestParameters: GenericRequestParameters): Promise<void>
}
