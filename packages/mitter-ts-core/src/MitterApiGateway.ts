import fetchIntercept from 'fetch-intercept'
import { MitterConstants } from './services/constants'
import URI from 'urijs'
import { parseJSON } from 'utils/responseUtils'
import axios, { AxiosError, AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'

export class MitterFetchApiInterceptor {
  // tslint:disable-next-line:variable-name
  private static MitterUrls = [ MitterConstants.MitterApiUrl, MitterConstants.MitterApiStagingUrl ]
  private unregister: () => void

  constructor(
    private applicationId: string,
    private userAuthorizationFetcher: () => string | undefined,
    private onTokenExpireExecutor: () => () => void
  ) {
  }

  enable() {
    fetchIntercept.register({
      request: this.requestInterceptor.bind(this),
      response: this.responseInterceptor.bind(this),
      responseError: function(error: Error) {
        return Promise.reject({message: error})
      }
    })
  }

  disable() {
    if (this.unregister !== undefined) {
      this.unregister()
    }
  }

  private interceptFilter(url: string, _: any): boolean {
    return ( MitterFetchApiInterceptor.MitterUrls
      .find((mitterUrl) => url.startsWith(mitterUrl)) !== undefined )
  }

  private requestInterceptor(url: string, config: any) {
    if (this.interceptFilter(url, config)) {
      let authorization = this.userAuthorizationFetcher()
      let interceptedUrl = url
      let interceptedConfig = config

      if (authorization === undefined) {
        console.warn('Calling an intercepted API, but credentials are not available. This call might fail')
      } else {
        if (config === undefined) {
          interceptedConfig = {}
        }

        const additionalHeaders = {
          'X-Issued-Mitter-User-Authorization': authorization,
          'X-Mitter-Application-Id': this.applicationId
        }

        interceptedConfig.headers = {...interceptedConfig.headers, ...additionalHeaders}
      }

      return [ interceptedUrl, interceptedConfig ]
    }

    return [ url, config ]
  }

  private responseInterceptor(response: Response, config: any) {
    if (this.interceptFilter(response.url, config)) {
      if (response.status >= 200 && response.status < 300) {
        return parseJSON(response)
      }

      if (response && typeof response.text === 'function') {
        return ( async () => {
          let message = ''
          let errorCode = ''
          const responseStatus = response.status
          await response.text().then(error => {
            message = JSON.parse(error).message
            errorCode = JSON.parse(error).errorCode
            console.log(message)
          })
          if (responseStatus === 401 && errorCode === 'claim_rejected') {
            this.onTokenExpireExecutor()
          }
          return Promise.reject({message: message, errorCode: errorCode, status: responseStatus})
        } )()
      }
      return Promise.reject(response)
    }
    return response
  }

}

export class MitterApiGateway {

  static centralApiUrl(): string {
    return MitterConstants.MitterApiUrl
  }

  constructor(
    private applicationId: string,
    private userAuthorizationFetcher: () => string | undefined
  ) {
  }

  userAuthorizedPath(path: string): string {
    const userAuthorization = this.userAuthorizationFetcher()
    let authorizedPath = URI(path)
      .addQuery('mitter.x_mitter_application_id', this.applicationId)

    if (userAuthorization !== undefined) {
      authorizedPath.addQuery('mitter.x_issued_mitter_user_authorization', userAuthorization)
    }

    return authorizedPath.toString()
  }
}

export class MitterAxiosApiInterceptor {
  // tslint:disable-next-line:variable-name
  private static MitterUrls = [ MitterConstants.MitterApiUrl, MitterConstants.MitterApiStagingUrl ]
  private mitterAxiosRequestInterceptor: AxiosInterceptorManager<AxiosRequestConfig> = axios.interceptors.request
  private mitterAxiosResponseInterceptor: AxiosInterceptorManager<AxiosResponse> = axios.interceptors.response

  constructor(
    private applicationId: string,
    private userAuthorizationFetcher: () => string | undefined,
    private onTokenExpireExecutor: () => () => void
  ) {
  }

  requestInterceptor(config: AxiosRequestConfig) {
    if (this.interceptFilter(config.url)) {
      config.headers = this.getHeaders()
      return config
    }
    return config
  }

  responseInterceptor(response: AxiosResponse<any>) {
    if (this.interceptFilter(response.config.url)) {
      return response
    } else {
      return response
    }
  }

  responseErrorInterceptor(error: AxiosError) {
    if (error.response.status === 401 && error.code === 'claim_rejected') {
      this.onTokenExpireExecutor()
    }
    return Promise.reject(error)
  }

  enable(axiosInstance?: AxiosInstance) {

    if (axiosInstance !== undefined) {
      axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => this.requestInterceptor(config))
      axiosInstance.interceptors.response.use((response: AxiosResponse<any>) => this.responseInterceptor(response),
        (error: AxiosError) => this.responseErrorInterceptor(error))
    } else {
      this.mitterAxiosRequestInterceptor.use((config: AxiosRequestConfig) => this.requestInterceptor(config))
      this.mitterAxiosResponseInterceptor.use((response: AxiosResponse<any>) => this.responseInterceptor(response),
        (error: AxiosError) => this.responseErrorInterceptor(error))
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
    return ( MitterAxiosApiInterceptor.MitterUrls
      .find((mitterUrl) => url.startsWith(mitterUrl)) !== undefined )
  }

  private getHeaders() {
    const authorization = this.userAuthorizationFetcher()
    const applicationId = this.applicationId
    return {
      'X-Issued-Mitter-User-Authorization': authorization,
      'X-Mitter-Application-Id': applicationId
    }
  }

}
