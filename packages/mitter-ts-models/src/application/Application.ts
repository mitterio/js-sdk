import IdentifiableEntity from '../annotations/IdentifiableEntity'

export class Application implements IdentifiableEntity<Application> {
  constructor(public applicationId: string, public name: string, public sandboxed: boolean) {}

  identifier() {
    return this.applicationId
  }
}
