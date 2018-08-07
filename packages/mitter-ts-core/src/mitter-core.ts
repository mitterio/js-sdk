export * from './Mitter'
export * from './specs/MessagingPipelineDriver'

export { default as MessagingPipelineDriver } from './specs/MessagingPipelineDriver'

export interface KvStore {
    getItem<T>(key: string): Promise<T | undefined>
    setItem<T>(key: string, value: T): Promise<void>
}
