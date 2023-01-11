export function isIterable<T>(obj: any): obj is Iterable<T> {
    if (obj == null) {
        return false;
    }

    return typeof obj[Symbol.iterator] === 'function';
}

export function isAsyncIterable<T>(obj: any): obj is AsyncIterable<T> {
    if (obj == null) {
        return false;
    }

    return typeof obj[Symbol.asyncIterator] === 'function';
}
