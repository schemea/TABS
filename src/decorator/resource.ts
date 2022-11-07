import "reflect-metadata";
import { Constructor } from "../types";
import { addDecoratorMetadata, hasDecorator } from "./utils";

export function Resource<T>(clazz: Constructor<T>) {
    addDecoratorMetadata(clazz, Resource);
    Object.assign(clazz, {
        from(map: Record<string, any>) {
            const object = Object.create(clazz.prototype);
            const mappings = Reflect.getMetadata("resource:mappings", clazz.prototype) || {};

            for (let [ key, value ] of Object.entries(map)) {
                if (mappings[key]) key = mappings[key];
                switch (Reflect.getMetadata("resource:type", object, key)) {
                    case "float":
                        value = parseFloat(value.replace(",", ""));
                        break;
                    case "int":
                        value = parseInt(value.replace(",", ""));
                        break;
                    case "string":
                    default:
                        break;
                }

                object[key] = value;
            }

            return object;
        },
    });
}

export function Type(type: "int" | "float" | "string") {
    return Reflect.metadata("resource:type", type);
}

export function Column(value: string) {
    return function (prototype: any, key: string) {
        const mappings = Reflect.getMetadata("resource:mappings", prototype) || {};
        mappings[value] = key;
        Reflect.defineMetadata("resource:mappings", mappings, prototype);
    };
}

export function isResource<T>(constructor?: Constructor<T>): constructor is (Constructor<T> & { from: Function });
export function isResource<T>(target?: T): target is T;
export function isResource<T>(target?: T): boolean {
    return hasDecorator(target, Resource);
}
