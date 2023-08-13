export function isObject(val: unknown): val is object {
    if (val === null) {
        return false;
    }
    return typeof val === 'function' || typeof val === 'object';
}

export function isIterable<T>(obj: unknown): obj is Iterable<T> {
    if (obj == null || obj === undefined) {
        return false;
    }

    return typeof (obj as Iterable<T>)[Symbol.iterator] === 'function';
}

export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
    if (obj == null || obj === undefined) {
        return false;
    }

    return (
        typeof (obj as AsyncIterable<T>)[Symbol.asyncIterator] === 'function'
    );
}

export function isString(obj: unknown): obj is string {
    return typeof obj === 'string' || obj instanceof String;
}
