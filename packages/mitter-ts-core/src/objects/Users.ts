import { Mitter } from '../Mitter'

export default class User {
    private readonly userId: string

    constructor(private readonly mitter: Mitter, userId: string | undefined = undefined) {
        if (userId === undefined) {
            this.userId = 'me'
        } else {
            this.userId = userId
        }
    }
}
