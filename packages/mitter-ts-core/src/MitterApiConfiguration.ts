import { AxiosInstance } from 'axios'
import { GenericInterceptor } from './auth/interceptors-base'

export class MitterApiConfiguration {
    constructor(
        public genericInterceptor: GenericInterceptor,
        public mitterApiBaseUrl: string,
        /* Should pass a generic interceptor, clients should not know the interceptor being used */
        public enableAxiosInterceptor: (axiosInstance: AxiosInstance) => void,
        public disableAxiosInterceptor?: (axiosInstance: AxiosInstance) => void
    ) {}
}
