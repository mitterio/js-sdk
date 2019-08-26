export type EntityMetadata = {
    [key: string]: any
}

export type AttachedEntityMetadata = {
    key: string,
    value: {
        "@type": any,
        text: any
    }
}

export interface MetadataAttachable {
  entityMetadata: EntityMetadata
}

export type QueriableMetadata = {
    key: string,
    value: any,
    operator: 'Contains' | 'Equals'
}
