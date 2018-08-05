import { PayloadUri } from './PayloadUri'

export class GoogleOAuthConfig {
  constructor(
    public googleRedirectUriL: PayloadUri,
    public googleOAuthEndpoint: PayloadUri,
    public googleOAuthClientId: string,
    public oauthRedirectUri: PayloadUri,
    public serviceActive: boolean
  ) {}
}
