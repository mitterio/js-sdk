import { AccessKey } from './AccessKey'

export class AccessCredentialStub {
  constructor(
    public accessKey: AccessKey,
    public lastUsed: number,
    public createdAt: number,
    public lastAction: string
  ) {}
}
