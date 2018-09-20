export interface GenericRequestParameters {
    data: any
    headers: { [headers: string]: string[] }
    method: string
    path: string
}

export interface GenericInterceptor {
    (requestParameters: GenericRequestParameters): void
}
