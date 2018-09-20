import { AxiosInstance } from 'axios'
import { Mitter, MitterAxiosInterceptionHost } from '../Mitter'
import axios from 'restyped-axios'

export function clientGenerator<T>() {
    return (mitterAxiosInterceptionHost: MitterAxiosInterceptionHost) => {
        const client = axios.create<T>({
            baseURL: mitterAxiosInterceptionHost.mitterApiBaseUrl
        })

        mitterAxiosInterceptionHost.enableAxiosInterceptor(client as AxiosInstance)
        return client
    }
}
