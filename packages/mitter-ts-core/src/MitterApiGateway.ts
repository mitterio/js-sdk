import { GenericInterceptor } from './auth/interceptors-base'
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosInterceptorManager,
    AxiosRequestConfig,
    AxiosResponse
} from 'axios'

export class MitterAxiosApiInterceptor {
    // tslint:disable-next-line:variable-name
    private mitterAxiosRequestInterceptor: AxiosInterceptorManager<AxiosRequestConfig> =
        axios.interceptors.request
    private mitterAxiosResponseInterceptor: AxiosInterceptorManager<AxiosResponse> =
        axios.interceptors.response

    constructor(
        private applicationId: string | undefined,
        private genericInterceptor: GenericInterceptor,
        private mitterApiBaseUrl: string
    ) {}

    requestInterceptor(config: AxiosRequestConfig) {
        if (this.interceptFilter(config!!.baseURL!!)) {
            this.genericInterceptor({
                data: config.data,
                path: config.url!!,
                headers: config.headers,
                method: config.method!!
            })

            return config
        }
        return config
    }

    responseInterceptor(response: AxiosResponse<any>) {
        if (this.interceptFilter(response!!.config!!.url!!)) {
            return response
        } else {
            return response
        }
    }

    responseErrorInterceptor(error: AxiosError) {
        /*
        if (error!!.response!!.status === 401 && error.code === 'claim_rejected') {
            if (this.onTokenExpireExecutor !== undefined) {
                this.onTokenExpireExecutor()
            }
        }
        */

        return Promise.reject(error)
    }

    enable(axiosInstance?: AxiosInstance) {
        if (axiosInstance !== undefined) {
            axiosInstance.interceptors.request.use((config: AxiosRequestConfig) =>
                this.requestInterceptor(config)
            )
            axiosInstance.interceptors.response.use(
                (response: AxiosResponse<any>) => this.responseInterceptor(response),
                (error: AxiosError) => this.responseErrorInterceptor(error)
            )
        } else {
            this.mitterAxiosRequestInterceptor.use((config: AxiosRequestConfig) =>
                this.requestInterceptor(config)
            )
            this.mitterAxiosResponseInterceptor.use(
                (response: AxiosResponse<any>) => this.responseInterceptor(response),
                (error: AxiosError) => this.responseErrorInterceptor(error)
            )
        }
    }

    disable(axiosInstance?: AxiosInstance) {
        if (axiosInstance !== undefined) {
            axiosInstance.interceptors.request.eject(3)
            axiosInstance.interceptors.response.eject(3)
        } else {
            this.mitterAxiosRequestInterceptor.eject(1)
            this.mitterAxiosResponseInterceptor.eject(2)
        }
    }

    private interceptFilter(url: string): boolean {
        return url.startsWith(this.mitterApiBaseUrl)
    }
}
