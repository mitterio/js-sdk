export interface StatefulPromise<T> extends Promise<T> {
    resolve(t?: T): void
    reject(e: any): void
    connect(promise: Promise<T>): void
}

export function statefulPromise<T>() {
    let _resolve: ((t?: T) => void) | undefined = undefined
    let _reject: ((e: any) => void) | undefined = undefined

    const promise = new Promise<T>((resolve, reject) => {
        _resolve = resolve
        _reject = reject
    }) as StatefulPromise<T>

    promise.resolve = _resolve!!
    promise.reject = _reject!!
    promise.connect = (outer: Promise<T>) => {
        outer.then((t: T) => _resolve!!(t)).catch((e: any) => _reject!!(e))
    }

    return promise
}
