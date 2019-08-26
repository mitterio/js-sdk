import { Identifier } from '../annotations/Identifier'

export class EntityProfileAttribute {
    constructor(
        public key: string,
        public contentType: string,
        public contentEncoding: string,
        public value: string
    ) {}
}

export class EntityProfile {
    constructor(public entityId: Identifier, public attributes: Array<EntityProfileAttribute>) {}
}

export class AttachedProfile {
    constructor(
        public attributes: Array<EntityProfileAttribute>
    ) {}
}
