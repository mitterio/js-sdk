import { AccessKey } from './AccessKey'
import { AccessSecret } from './AccessSecret'

export class AccessCredential {
  constructor(
    public accessKey: AccessKey,
    public accessSecret: AccessSecret,
    public createdAt: number
  ) {}
}
