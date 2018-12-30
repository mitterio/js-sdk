import { AxiosInstance } from 'axios'
import axios from 'restyped-axios'
import { MitterApiConfiguration } from '../MitterApiConfiguration'

export function clientGenerator<T>() {
    return (mitterApiConfiguration: MitterApiConfiguration) => {
        const client = axios.create<T>({
            baseURL: mitterApiConfiguration.mitterApiBaseUrl
        })

        mitterApiConfiguration.enableAxiosInterceptor(client as AxiosInstance)

        return client
    }
}
