export class DigestParts {
    constructor(
        public readonly method: string,
        public readonly path: string,
        public readonly payloadMd5: string,
        public readonly nonce?: string | undefined,
        public readonly contentType?: string | undefined,
        public readonly date?: string | undefined
    ) {}
}

export class DigestGenerationArtifacts {
    constructor(
        public readonly nonce: string,
        public date: string,
        public authorizationHeader: string
    ) {}
}
