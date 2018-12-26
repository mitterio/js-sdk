export type StandardUserProfileAttributes = {
    firstName: string
    lastName: string
    avatarURL: string
    mobile: string
    dob: string
    bio: string
    gender: string
    email: string
    street: string
    city: string
    state: string
    zip: string
    country: string
}
export const standardUserProfileAttributes: StandardUserProfileAttributes = {
    firstName: 'mitter.user.profile.attribute.FirstName',
    lastName: 'mitter.user.profile.attribute.LastName',
    avatarURL: 'mitter.upa.AvatarURL',
    mobile: 'mitter.upa.Mobile',
    dob: 'mitter.upa.DOB',
    bio: 'mitter.upa.Bio',
    gender: 'mitter.upa.Gender',
    email: 'mitter.upa.Email',
    street: 'mitter.upa.address.Street',
    city: 'mitter.upa.address.City',
    state: 'mitter.upa.address.State',
    zip: 'mitter.upa.address.Zip',
    country: 'mitter.upa.address.Country'
}

export class AttributeDef {
    constructor(
        public type: string,
        public allowedContentTypes: Array<string>,
        public allowedContentEncodings: Array<string>,
        public canBeEmpty: boolean
    ) {}
}

class Attribute {
    constructor(
        public type: string,
        public contentType: string,
        public contentEncoding: string,
        public value: string
    ) {}
}

export class UserProfile {
    constructor(public userId: string, public attributes: Array<Attribute>) {}
}
