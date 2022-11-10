import { Constructor } from "../types";

const METADATA_KEY = "resource:indexes";

export function Index<T extends Object>(prototype: T, key: keyof T) {
    const indexes: (keyof T)[] = Reflect.getMetadata(METADATA_KEY, prototype) || [];
    indexes.push(key);
    Reflect.defineMetadata(METADATA_KEY, indexes, prototype);
}

export function getIndexes<T>(target: Constructor<T>): (keyof T)[] {
    return Reflect.getMetadata(METADATA_KEY, target.prototype) || [];
}
