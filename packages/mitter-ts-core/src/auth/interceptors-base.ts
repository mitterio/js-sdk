import { Mitter } from '../Mitter'

export interface GenericInterceptor {
    (mitter: Mitter, data: any, headers: { [header: string]: string[] }): Promise<void>
}
