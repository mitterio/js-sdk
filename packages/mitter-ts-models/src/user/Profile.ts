export enum StandardUserProfileAtrributes {
  FirstName = 'mitter.user.profile.attribute.FirstName',
  LastName = 'mitter.user.profile.attribute.LastName'
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
