export * from './Mitter'
export * from './specs/MessagingPipelineDriver'
export * from './services/constants'
export * from './MitterApiGateway'
export * from './auth/interceptors-base'
export * from './models/auth/credentials-base'
export * from './models/named-entities'
export * from './services'
export * from './utils'
export * from './models/type-matchers/pipeline-payloads'
export * from './models/platformImplementedFeatures'
export * from './utils/profileBuilder/ChannelProfileBuilder'
export * from './utils/profileBuilder/UserProfileBuilder'
export * from './constants'
export * from './MitterApiConfiguration'
export * from './utils/pagination/ChannelPaginationManager'
export * from './utils/pagination/MessagePaginationManager'
export * from './utils/pagination/ParticipatedChannelsPaginationManager'
export * from './utils/pagination/PaginationInterface'
export * from './utils/presenceBuilder/StandardUserPresenceTypes'
export * from './utils/presenceBuilder/UserPresenceBuilder'

export { default as MessagingPipelineDriver } from './specs/MessagingPipelineDriver'
export { PlatformMitter } from './Mitter'

export interface KvStore {
    getItem<T>(key: string): Promise<T | undefined>
    setItem<T>(key: string, value: T): Promise<void>
    clearAll?(): Promise<void>
}
