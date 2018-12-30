import IdentifiableEntity from '../annotations/IdentifiableEntity'

export class Subscriber implements IdentifiableEntity<Subscriber> {
  constructor(
    public subscriberId: string,
    public userName: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public mobile: string
  ) {}

  public identifier(): string {
    return this.subscriberId
  }
}
