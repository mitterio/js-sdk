import {Presence} from "@mitter-io/models";

class UserPresenceBuilder {
    private presenceList: Array<Presence> = []

    startWith(presence: Presence): UserPresenceBuilder {
        this.then(presence)
        return this
    }

    then(presence: Presence): UserPresenceBuilder {
        this.presenceList.push(presence)
        return this
    }

    build(): Presence {
        return this.presenceList.reduceRight((presence,reducedPresence) => {
            const copyOfReducedPresence = {...reducedPresence}
            const copyOfPresence =  {...presence}
            copyOfReducedPresence.expiresTo = copyOfPresence
            return copyOfReducedPresence

        })
    }
}

export default UserPresenceBuilder
