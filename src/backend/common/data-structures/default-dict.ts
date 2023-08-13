import type { Factory } from '../types/factory';

export class DefaultDict<K, V, Vs = Array<V>> extends Map<K, Vs> {
    static withArray<K, V>(): DefaultDict<K, V, Array<V>> {
        return new this<K, V, Array<V>>(
            () => [],
            (value, elements) => elements.push(value)
        );
    }

    constructor(
        readonly defaultFactory: Factory<Vs>,
        readonly insert: (value: V, values: Vs) => void
    ) {
        super();
        this.defaultFactory = defaultFactory;
        this.insert = insert;
    }

    get(key: K) {
        let values = super.get(key);

        if (values === undefined) {
            values = this.defaultFactory();
            super.set(key, values);
        }

        return values;
    }

    add(key: K, value: V) {
        this.insert(value, this.get(key));
    }
}
