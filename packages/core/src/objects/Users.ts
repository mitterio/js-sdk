import { User, UserLocator } from '@mitter-io/models'
import { TypedAxiosInstance } from 'restyped-axios'
import { Mitter } from '../Mitter'
import { ChannelsApi, channelsClientGenerator, UsersApi, usersClientGenerator } from '../services'
import { MitterObject } from './mitter-objects'

export default class MitterUser extends MitterObject<MitterUser, User> {
    private readonly _userId: string
    private readonly usersClient: TypedAxiosInstance<UsersApi>
    private readonly channelsClient: TypedAxiosInstance<ChannelsApi>

    constructor(private readonly mitter: Mitter, userId: string | undefined = undefined) {
        super()

        if (userId === undefined) {
            this._userId = 'me'
        } else {
            this._userId = userId
        }

        this.usersClient = usersClientGenerator(this.mitter.mitterApiConfigurationProvider())
        this.channelsClient = channelsClientGenerator(this.mitter.mitterApiConfigurationProvider())

        super.init(() => {
            return this.usersClient
                .get<'/v1/users/:userId'>(`/v1/users/${this._userId}`)
                .then(x => x.data)
        })
    }

    get userId(): Promise<string> {
        return super.proxy('userId')
    }

    get systemUser(): Promise<boolean> {
        return super.proxy('systemUser')
    }

    get synthetic(): Promise<boolean> {
        return super.proxy('synthetic')
    }

    get screenName(): Promise<{ screenName: string }> {
        return super.proxy('screenName')
    }

    get identifier(): Promise<() => string> {
        return super.proxy('identifier')
    }

    get userLocators(): Promise<UserLocator[]> {
        return super.proxy('userLocators')
    }

    channels() {
        this.channelsClient
            .get<'/v1/users/:userId/channels'>(`/v1/users/${this._userId}/channels`)
            .then(x => x.data)
    }
}
