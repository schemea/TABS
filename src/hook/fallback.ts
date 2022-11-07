import { useRef } from "react";

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
