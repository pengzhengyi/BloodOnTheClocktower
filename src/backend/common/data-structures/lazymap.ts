import type { Loader } from '../types/loader';

export class LazyMap<K, V> extends Map<K, V> {
    constructor(readonly loader: Loader<K, V>) {
        super();
    }

    get(key: K): V | undefined {
        if (!super.has(key)) {
            const value = this.loader(key);
            if (value !== undefined) {
                super.set(key, value);
            }
            return value;
        }

        return super.get(key);
    }

    getOrDefault(key: K, defaultValue: V): V {
        return super.get(key) ?? defaultValue;
    }
}
