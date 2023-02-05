import type { Loader } from '../types';
import { isString } from '~/utils/common';

export abstract class SelfProxy {
    readonly proxyHandlerPropertyNames: Array<keyof ProxyHandler<this>> = [
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

export function createRecordProxy<V>(
    loader: Loader<string, V>
): Record<string, V> {
    const obj = {};
    return new Proxy(obj, {
        get(target, p, receiver) {
            if (isString(p)) {
                return loader(p);
            } else {
                return Reflect.get(target, p, receiver);
            }
        },
    });
}
