/// <reference types="node" />

declare module 'fetch-intercept' {
    interface FetchIntercept {
        register: (requset: any, response: any) => {}
    }

    export default FetchIntercept
}
