export interface Pagination<T> {
    before: string | undefined
    after: string | undefined
    limit?: number | undefined
    nextPage(): Promise<T[]>
    prevPage(): Promise<T[]>
}
