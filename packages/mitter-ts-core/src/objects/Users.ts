import { Mitter } from '../Mitter'
import { usersClientGenerator, channelsClientGenerator } from '../services'
import { TypedAxiosInstance } from 'restyped-axios'
import { UsersApi, ChannelsApi } from '../services'
import { User, ParticipatedChannel, UserLocator } from 'mitter-models'
import { MitterObject } from './mitter-objects'

export default class MitterUser extends MitterObject<MitterUser, User> {
    get userId() {
        return super.proxy('userId')
    }

    get systemUser(): Promise<boolean> {
        return super.proxy('systemUser')
    }

    get synthetic(): Promise<boolean> {
        return super.proxy('synthetic')
    }

    get screenName(): Promise<string> {
        return super.proxy('screenName')
    }

    get identifier(): Promise<() => string> {
        return super.proxy('identifier')
    }

    get userLocators(): Promise<UserLocator[]> {
        return super.proxy('userLocators')
    }

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

        this.usersClient = usersClientGenerator(this.mitter)
        this.channelsClient = channelsClientGenerator(this.mitter)

        super.init(() => {
            return this.usersClient
                .get<'/v1/users/:userId'>(`/v1/users/${this._userId}`)
                .then(x => x.data.user)
        })
    }

    channels() {
        this.channelsClient
            .get<'/v1/users/:userId/channels'>(`/v1/users/${this._userId}/channels`)
            .then(x => x.data)
    }
}
