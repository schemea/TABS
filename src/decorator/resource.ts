import "reflect-metadata";
import { Constructor } from "../types";
import { addDecoratorMetadata, hasDecorator } from "./utils";
import { getMappings } from "./column";

function parseValue(type: string, value: string): any {
    switch (type) {
        case "float":
            return parseFloat(value.replace(",", ""));
        case "int":
            return parseInt(value.replace(",", ""));
        case "list":
            return value.split;
        case "string":
        default:
            return value;
    }
}

function getDefaultValue(type: string) {
    switch (type) {
        case "float":
        case "int":
            return 0;
        case "list":
            return [];
        case "string":
        default:
            return "";
    }
}

export function Resource<T>(clazz: Constructor<T>) {
    addDecoratorMetadata(clazz, Resource, true);
    Object.assign(clazz, {
        from(map: Record<string, any>) {
            const object = Object.create(clazz.prototype);
            const mappings = getMappings(clazz);

            for (let [ key, value ] of Object.entries(map)) {
                if (mappings[key]) key = mappings[key];
                const delimiter = Reflect.getMetadata("resource:delimiter", object, key);
                const type = Reflect.getMetadata("resource:type", object, key);

                if (value) {
                    if (delimiter) {
                        value = (value as string).split(delimiter)
                            .map(element => element.trim())
                            .map(element => parseValue(type, element));
                    } else {
                        value = parseValue(type, value);
                    }
                } else {
                    value = getDefaultValue(type);
                }

                object[key] = value;
            }

            return object;
        },
    });
}

export function Type<T>(type: "int" | "float" | "string") {
    return Reflect.metadata("resource:type", type);
}

export function List<T>(delimiter: string) {
    return Reflect.metadata("resource:delimiter", delimiter);
}

export function isResource<T>(constructor?: Constructor<T>): constructor is (Constructor<T> & { from: Function });
export function isResource<T>(target?: T): target is T;
export function isResource<T>(target?: T): boolean {
    return hasDecorator(target, Resource);
}
