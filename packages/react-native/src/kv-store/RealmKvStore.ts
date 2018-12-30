import { KvStore as MitterKvStore } from '@mitter-io/core'
import Realm from 'realm'
// tslint: disable-next-line:variable-line
const StoreSchemaName = 'SimpleKvStore'

class KvPair {
  static schema = {
    name: StoreSchemaName,
    primaryKey: 'key',
    properties: {
      key: 'string',
      value: 'string'
    }
  }

  public key: string = ''
  public value: string = ''
}

export default class KvStore implements MitterKvStore {
  private realmStore: Promise<Realm>

  constructor() {
    this.realmStore = Realm.open({
      schema: [KvPair]
    })
  }

  getItem<T>(key: string): Promise<T | undefined> {
    return this.realmStore
      .then((realm) => {
        const p = realm.objectForPrimaryKey<KvPair>(KvPair, key)

        if (p === undefined) {
          return undefined
        }

        return JSON.parse(p.value) as T

      })
  }

  setItem<T>(key: string, value: T): Promise<void> {
    return this.realmStore
      .then((realm) => {
        realm.write(() => {
          realm.create(KvPair, {
            key: key,
            value: JSON.stringify(value)
          }, true)
        })
      })
  }

  removeItem(key: string): Promise<void> {
    return this.realmStore
      .then((realm) => {
        realm.write(() => {
          const p  = realm.objectForPrimaryKey<KvPair>(KvPair,key)
          realm.delete(p)
        })
      })
  }

}
