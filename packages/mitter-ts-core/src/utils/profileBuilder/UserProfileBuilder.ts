import {
    EntityProfileAttribute,
    StandardUserProfileAttributes,
    standardUserProfileAttributes
} from '@mitter-io/models'

import ProfileBaseBuilder from './ProfileBaseBuilder'

export class UserProfileBuilder extends ProfileBaseBuilder<StandardUserProfileAttributes> {
    private attributes: {
        [P in keyof StandardUserProfileAttributes]: EntityProfileAttribute | undefined
    } = {
        firstName: undefined,
        lastName: undefined,
        avatarURL: undefined,
        mobile: undefined,
        dob: undefined,
        bio: undefined,
        gender: undefined,
        email: undefined,
        street: undefined,
        city: undefined,
        state: undefined,
        zip: undefined,
        country: undefined
    }

    constructor() {
        super()
    }

    withFirstName(firstName: string): UserProfileBuilder {
        this.attributes.firstName = this.addAttribute(
            standardUserProfileAttributes.firstName,
            firstName
        )
        return this
    }

    withLastName(lastName: string): UserProfileBuilder {
        this.attributes.lastName = this.addAttribute(
            standardUserProfileAttributes.lastName,
            lastName
        )
        return this
    }

    withAvatarUrl(avatarURL: string): UserProfileBuilder {
        this.attributes.avatarURL = this.addAttribute(
            standardUserProfileAttributes.avatarURL,
            avatarURL
        )
        return this
    }

    withMobile(mobile: string): UserProfileBuilder {
        this.attributes.mobile = this.addAttribute(standardUserProfileAttributes.mobile, mobile)
        return this
    }

    withDob(dob: string): UserProfileBuilder {
        this.attributes.dob = this.addAttribute(standardUserProfileAttributes.dob, dob)
        return this
    }

    withBio(bio: string): UserProfileBuilder {
        this.attributes.bio = this.addAttribute(standardUserProfileAttributes.bio, bio)
        return this
    }

    withGender(gender: string): UserProfileBuilder {
        this.attributes.gender = this.addAttribute(standardUserProfileAttributes.gender, gender)
        return this
    }

    withEmail(email: string): UserProfileBuilder {
        this.attributes.email = this.addAttribute(standardUserProfileAttributes.email, email)
        return this
    }

    withStreet(street: string): UserProfileBuilder {
        this.attributes.street = this.addAttribute(standardUserProfileAttributes.street, street)
        return this
    }

    withCity(city: string): UserProfileBuilder {
        this.attributes.city = this.addAttribute(standardUserProfileAttributes.city, city)
        return this
    }

    withState(state: string): UserProfileBuilder {
        this.attributes.state = this.addAttribute(standardUserProfileAttributes.state, state)
        return this
    }

    withZip(zip: string): UserProfileBuilder {
        this.attributes.zip = this.addAttribute(standardUserProfileAttributes.zip, zip)
        return this
    }

    withCountry(country: string): UserProfileBuilder {
        this.attributes.country = this.addAttribute(standardUserProfileAttributes.country, country)
        return this
    }

    buildProfile(): EntityProfileAttribute[] {
        for (const key in this.attributes) {
            if (this.attributes[key as keyof StandardUserProfileAttributes] === undefined) {
                delete this.attributes[key as keyof StandardUserProfileAttributes]
            }
        }

        // return new ProfileBaseBuilder<StandardUserProfileAttributes>().build(this.attributes)
        return this.build<StandardUserProfileAttributes>(this.attributes)
    }
}
