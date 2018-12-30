export type PickedPartial<P extends object, K extends keyof P> = Partial<P> & Pick<P, K>
