export class MetadataEntry {
  constructor(public payload: string, public systemEntry: boolean) {}
}

type metadataType = { [propname: string]: MetadataEntry }

export class EntityMetadata {
  constructor(public metadata: metadataType[]) {}
}

export interface MetadataAttachable {
  entityMetaData: EntityMetadata
}
