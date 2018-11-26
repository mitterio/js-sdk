import { AsyncStorage } from 'react-native'
import { KvStore as MitterKvStore } from '@mitter-io/core'

export default class KvStore implements MitterKvStore {
  async getItem<T>(key: string): Promise<T|undefined> {
    let item = await AsyncStorage.getItem(key)

    if (item === null) {
      return undefined
    }

    return JSON.parse(item) as T
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    AsyncStorage.setItem(key, JSON.stringify(value))
  }

  async removeItem(key: string): Promise<void> {
    AsyncStorage.removeItem(key)
  }
}
