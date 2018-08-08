import { KvStore as MitterKvStore } from 'mitter-core'

declare var localStorage: any

export default class KvStore implements MitterKvStore {
    async getItem<T>(key: string): Promise<T|undefined> {
        let item = localStorage.getItem(key)

        if (item === null) {
            return undefined
        }

        return JSON.parse(item) as T
    }

    async setItem<T>(key: string, value: T): Promise<void> {
        localStorage.setItem(key, JSON.stringify(value))
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(key)
    }
}
