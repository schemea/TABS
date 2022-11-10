import { Constructor } from "../types";

const METADATA_KEY = "resource:mappings";

export function Column(value: string) {
    return function (prototype: any, key: string) {
        const mappings = Reflect.getMetadata(METADATA_KEY, prototype) || {};
        mappings[value] = key;
        Reflect.defineMetadata(METADATA_KEY, mappings, prototype);
    };

}

export function getMappings<T>(target: Constructor<T>): Record<string, string> {
    return Reflect.getMetadata(METADATA_KEY, target.prototype) || {};
}
