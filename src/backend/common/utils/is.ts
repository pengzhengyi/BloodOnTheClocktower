export function isObject(val: unknown): val is object {
    if (val === null) {
        return false;
    }
    return typeof val === 'function' || typeof val === 'object';
}
