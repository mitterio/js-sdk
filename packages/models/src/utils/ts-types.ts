export type PickedPartial<P extends object, K extends keyof P> = Partial<P> & Pick<P, K>

/*in the latets TS version Omit is part of the library itself */
/** for omitting a certain key(s)*/
export type Omit<T extends object, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/** for making a certain key(s) partial
 * uses omit to exclude the key , the adds the key as a partial
 * */
export type MakeKeyPartial<T extends object , K extends keyof T> = Omit<T, K> & {[P in K]? : T[K]}
