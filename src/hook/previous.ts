import { useRef } from "react";

function dependenciesEqual(a: any[], b: any[]) {
    if (a === b) return true;
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i++) {
        const x = a[i];
        const y = b[i];

        if (x === y) return false;
    }

    return true;
}


export function usePrevious<T>(current: T, deps: any[], initial: T): T;
export function usePrevious<T>(current: T, deps: any[]): T | undefined;
export function usePrevious<T>(current: T, deps: any[], initial?: T) {
    const ref = useRef({
        value: initial,
        deps,
    });

    if (!dependenciesEqual(ref.current.deps, deps)) {
        ref.current = { value: current, deps };
    }

    return ref.current.value;
}

export function usePreviousFallback<T>(value: T, predicate: (value: T) => boolean, defaultValue: T): T;
export function usePreviousFallback<T>(value: T, predicate?: (value: T) => boolean): T | undefined;
export function usePreviousFallback<T>(value: T, predicate = (value: T) => !!value, defaultValue?: T): T | undefined {
    const ref = useRef(value);
    const previous = ref.current;

    if (predicate(value)) {
        ref.current = value;
        return value;
    } else if (predicate(previous)) return previous;
    else return defaultValue;
}
