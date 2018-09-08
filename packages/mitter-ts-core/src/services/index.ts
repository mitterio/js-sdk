import { UsersApi } from './UsersClient'
import { ChannelsApi } from './ChannelsClient'
import { MessagesApi } from './MessagesClient'
import axios from 'restyped-axios'
import { Mitter } from '../Mitter'
import { AxiosInstance } from 'axios'

function clientGenerator<T>() {
    return (mitter: Mitter) => {
        const client = axios.create<T>({
            baseURL: mitter.mitterApiBaseUrl
        })

        mitter.enableAxiosInterceptor(client as AxiosInstance)
        return client
    }
}

export * from './ChannelsClient'
export * from './MessagesClient'
export * from './UsersClient'

export const usersClientGenerator = clientGenerator<UsersApi>()
export const channelsClientGenerator = clientGenerator<ChannelsApi>()
export const messagesClientGenerator = clientGenerator<MessagesApi>()
