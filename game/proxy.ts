export class SelfProxy {
    protected readonly proxyHandlerPropertyNames: Array<
        keyof ProxyHandler<this>
    > = [
        'apply',
        'construct',
        'defineProperty',
        'deleteProperty',
        'get',
        'getOwnPropertyDescriptor',
        'getPrototypeOf',
        'has',
        'isExtensible',
        'ownKeys',
        'preventExtensions',
        'set',
        'setPrototypeOf',
    ];

    protected get handler(): ProxyHandler<this> {
        const handlerObject: ProxyHandler<this> = {};

        for (const propertyName of this.proxyHandlerPropertyNames) {
            // @ts-ignore: ProxyHandler methods can optionally be implemented
            if (this[propertyName] !== undefined) {
                // @ts-ignore: the type will match ProxyHandler
                handlerObject[propertyName] = this[propertyName];
            }
        }

        return handlerObject;
    }

    protected getProxy(): this {
        return new Proxy(this, this.handler);
    }
}
