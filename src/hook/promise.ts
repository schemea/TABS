import { useEffect, useState } from "react";

export function usePromise<P>(promise: Promise<P>): P;
export function usePromise<P, R>(promise: Promise<P>, fn: (value: P) => Promise<R>, initialValue: R): R;
export function usePromise<P, R>(promise: Promise<P>, fn: (value: P) => R, initialValue: R): R;
export function usePromise<P, R>(promise: Promise<P>, fn: (value: P) => Promise<R>): R | undefined;
export function usePromise<P, R>(promise: Promise<P>, fn: (value: P) => R): R | undefined;
export function usePromise<P, R>(promise: Promise<P>, fn?: Function, initialValue?: R): R | undefined {
    const [ state, setState ] = useState(initialValue);

    useEffect(function () {
        promise
            .then(value => fn ? fn(value) : value)
            .then(value => setState(value));
    }, []);

    return state;
}

// export function usePromiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
//     return useMemo(() => Promise.all(values), [ ...values ]);
// }
