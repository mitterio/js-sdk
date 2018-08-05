export * from './Mitter'

export interface KvStore {
  getItem<T>(key: string): Promise<T | undefined>
  setItem<T>(key: string, value: T): Promise<void>
}
