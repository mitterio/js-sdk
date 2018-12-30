abstract class ApplicationProperty {
  public readonly isDefault: boolean = false

  // ? due to eventBusProperty
  protected constructor(public systemName?: string, public instanceName?: string) {}
}

export default ApplicationProperty
