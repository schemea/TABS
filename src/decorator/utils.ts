export function getAllDecorators<T>(target: T): Record<string, any> {
    return Reflect.getMetadata("decorators", target as Object) || {};
}

export function addDecoratorMetadata<T>(target: T, decorator: Function, params: any) {
    const decorators = getAllDecorators(target);
    decorators[decorator.name] = params;
    Reflect.defineMetadata("decorators", decorators, target as Object);
}

export function getDecorator<T>(target: any, decorator: Function): T {
    return getAllDecorators(target)[decorator.name];
}

export function hasDecorator<T>(target: T, decorator: Function): boolean {
    return !!getDecorator(target, decorator);
}
