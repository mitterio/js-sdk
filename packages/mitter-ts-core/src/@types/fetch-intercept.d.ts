/// <reference types="node" />

declare module 'fetch-intercept' {
    interface InterceptorRegistration {
        request?(url: string, config: {}): [string, {}]
        requestError?(error: {}): Promise<{}>
        response?(response: Response): Response
        responseError?(error: {}): Promise<{}>
    }

    interface FetchIntercept {
        register(interceptRegistration: InterceptorRegistration): any
    }

    let fetchIntercept: FetchIntercept

    export default fetchIntercept
}
