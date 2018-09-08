import { Mitter } from '../Mitter'
import { usersClientGenerator } from '../services'
import { TypedAxiosInstance } from 'restyped-axios'
import { UsersApi } from '../services/UsersClient'
import { User } from 'mitter-models'

export default class MitterUser {
    private readonly userId: string
    private readonly usersClient: TypedAxiosInstance<UsersApi>

    constructor(private readonly mitter: Mitter, userId: string | undefined = undefined) {
        if (userId === undefined) {
            this.userId = 'me'
        } else {
            this.userId = userId
        }

        this.usersClient = usersClientGenerator(this.mitter)
    }

    async get(): Promise<User> {
        return this.usersClient
            .get<'/v1/users/:userId'>(`/v1/users/${this.userId}`)
            .then(x => x.data)
    }
}
