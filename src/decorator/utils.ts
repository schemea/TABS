export function addDecoratorMetadata<T>(target: T, decorator: Function) {
    const decorators: string[] = Reflect.getMetadata("decorators", target as Object) || [];
    decorators.push(decorator.name);
    Reflect.defineMetadata("decorators", decorators, target as Object);
}

export function getDecorators<T>(target: T): string[] {
    return Reflect.getMetadata("decorators", target as Object) || [];
}

export function hasDecorator<T>(target: T, decorator: Function): boolean {
    return getDecorators(target).includes(decorator.name);
}
