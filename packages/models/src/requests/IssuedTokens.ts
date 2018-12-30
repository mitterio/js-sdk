export class IssuedUserToken {
  constructor(
    public userToken: {
      signedToken: string
      supportedHeaders: string[]
      supportedCookies: string[]
      tokenId: string
    }
  ) {}
}
