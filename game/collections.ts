import { Factory, Loader, Predicate, Prioritization, Transform } from './types';

export class LazyMap<K, V> extends Map<K, V> {
    constructor(readonly loader: Loader<K, V>) {
        super();
        this.loader = loader;
    }

    get(key: K) {
        if (!super.has(key)) {
            const value = this.loader(key);
            if (value !== undefined) {
                super.set(key, value);
            }
            return value;
        }

        return super.get(key);
    }
}

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

export class Generator<T> implements Iterable<T> {
    static *filter<T>(
        predicate: Predicate<T>,
        iterable: Iterable<T>
    ): Iterable<T> {
        for (const element of iterable) {
            if (predicate(element)) {
                yield element;
            }
        }
    }

    static *limit<T>(n: number, iterable: Iterable<T>): Iterable<T> {
        for (const element of iterable) {
            if (n-- > 0) {
                yield element;
            } else {
                return;
            }
        }
    }

    static *map<T1, T2>(
        transform: Transform<T1, T2>,
        iterable: Iterable<T1>
    ): Iterable<T2> {
        for (const element of iterable) {
            yield transform(element);
        }
    }

    static *cartesian_product<T1, T2>(
        iterable1: Iterable<T1>,
        iterable2: Iterable<T2>
    ): Iterable<[T1, T2]> {
        const elements2: Array<T2> = [];
        let isFirst = true;

        for (const element1 of iterable1) {
            for (const element2 of isFirst ? iterable2 : elements2) {
                elements2.push(element2);
                yield [element1, element2];
            }
            isFirst = false;
        }
    }

    static *chain<T = any>(...iterables: Array<Iterable<T>>): Iterable<T> {
        for (const iterable of iterables) {
            for (const element of iterable) {
                yield element;
            }
        }
    }

    static groupBy<T1, T2 = T1>(
        iterable: Iterable<T1>,
        getGroup?: Transform<T1, T2>
    ): Map<T2, Array<T1>> {
        if (getGroup === undefined) {
            getGroup = (element) => element as unknown as T2;
        }

        const groupToElements = DefaultDict.withArray<T2, T1>();

        for (const element of iterable) {
            const group = getGroup(element);
            groupToElements.add(group, element);
        }

        return groupToElements;
    }

    static *prioritize<T1, T2 = T1>(
        iterable: Iterable<T1>,
        prioritization: Prioritization<T2>,
        key?: Transform<T1, T2>
    ): Iterable<T1> {
        if (key === undefined) {
            key = (element) => element as unknown as T2;
        }

        const pastKeys: Set<T2> = new Set();
        const iterator = prioritization[Symbol.iterator]();
        let {
            done,
            value: {
                key: pKey = undefined,
                desiredNumber = Number.POSITIVE_INFINITY,
                isStrictUpperbound = false,
            } = {},
        } = iterator.next();

        const unmatchedKeyToElements = DefaultDict.withArray<T2, T1>();

        for (const element of iterable) {
            if (done) {
                return;
            }

            const elementKey = key(element);
            if (elementKey === pKey) {
                yield element;
                if (--desiredNumber === 0) {
                    if (!isStrictUpperbound) {
                        // for strict upperbound, element of this key is no longer needed
                        pastKeys.add(pKey);
                    }

                    // find next key that has not been fulfilled yet (combining history)
                    do {
                        ({
                            done,
                            value: {
                                key: pKey = undefined,
                                desiredNumber = Number.POSITIVE_INFINITY,
                                isStrictUpperbound = false,
                            } = {},
                        } = iterator.next());
                        const elementsMatchingKey =
                            unmatchedKeyToElements.get(pKey);
                        if (
                            elementsMatchingKey !== undefined &&
                            elementsMatchingKey.length > 0
                        ) {
                            // empty existing elements of this key first
                            const numElementToTake = isStrictUpperbound
                                ? Math.min(
                                      elementsMatchingKey.length,
                                      desiredNumber
                                  )
                                : elementsMatchingKey.length;
                            yield* new Generator(
                                elementsMatchingKey,
                                [],
                                false
                            ).limit(numElementToTake);
                            desiredNumber -= numElementToTake;
                        }
                    } while (desiredNumber <= 0);
                }
            } else if (pastKeys.has(elementKey)) {
                yield element;
            } else {
                unmatchedKeyToElements.add(elementKey, element);
            }
        }

        do {
            const elementsMatchingKey = unmatchedKeyToElements.get(pKey);
            if (
                elementsMatchingKey !== undefined &&
                elementsMatchingKey.length > 0
            ) {
                const numElementToTake = isStrictUpperbound
                    ? Math.min(elementsMatchingKey.length, desiredNumber)
                    : elementsMatchingKey.length;
                yield* new Generator(elementsMatchingKey, [], false).limit(
                    numElementToTake
                );
            }
            ({
                done,
                value: {
                    key: pKey = undefined,
                    desiredNumber = Number.POSITIVE_INFINITY,
                    isStrictUpperbound = false,
                } = {},
            } = iterator.next());
        } while (!done);
    }

    static combinations<T>(
        k: number,
        iterable: Iterable<T>
    ): Iterable<Array<T>> {
        const column: Array<Generator<Array<T>>> = [];

        for (const element of iterable) {
            for (let i = Math.min(column.length, k - 1); i >= 0; i--) {
                const lastDiagonal = column[i - 1];
                const lastLeft = column[i];

                if (lastDiagonal === undefined) {
                    if (lastLeft === undefined) {
                        column[i] = new Generator([[element]]);
                    } else {
                        column[i] = new Generator(lastLeft).chain([[element]]);
                    }
                } else {
                    const newElementAsArray = [element];
                    const columnElement = new Generator(lastDiagonal).map(
                        (combination) => combination.concat(newElementAsArray)
                    );

                    if (lastLeft === undefined) {
                        column[i] = columnElement;
                    } else {
                        column[i] = columnElement.chain(lastLeft);
                    }
                }
            }
        }

        return column[column.length - 1];
    }

    static take<T>(
        n: number | undefined,
        iterable: Iterable<T>
    ): undefined | T | Array<T> {
        const elements =
            n === undefined
                ? Array.from(iterable)
                : Array.from(Generator.limit(n, iterable));
        if (n === 1) {
            return elements[0];
        } else {
            return elements;
        }
    }

    static once<T>(iterable: Iterable<T>): Generator<T> {
        return new this(iterable, [], false);
    }

    static empty<T>(): Generator<T> {
        return new this<T>([], [], false);
    }

    protected cached?: Array<T>;

    *[Symbol.iterator]() {
        const supportMultipleIterations = this.supportMultipleIterations;
        if (this.cached === undefined) {
            if (supportMultipleIterations) {
                this.cached = [];
            }

            const iterable = this.transforms.reduce(
                (iterable, transform) => transform(iterable),
                this.iterable
            );

            for (const element of iterable) {
                if (supportMultipleIterations) {
                    this.cached!.push(element);
                }

                yield element;
            }
        } else {
            yield* this.cached;
        }
    }

    constructor(
        public iterable: Iterable<T>,
        public transforms: Array<Transform<Iterable<T>>> = [],
        readonly supportMultipleIterations: boolean = true
    ) {
        this.iterable = iterable;
        this.transforms = transforms;
        this.supportMultipleIterations = supportMultipleIterations;
    }

    transform(transform: Transform<Iterable<T>>) {
        if (this.supportMultipleIterations && this.cached !== undefined) {
            // result already iterated once, operate on cache instead
            this.iterable = this.cached;
            this.cached = undefined;
            this.transforms = [];
        }

        this.transforms.push(transform);
        return this;
    }

    become<T2>(transform: Transform<Iterable<T>, Iterable<T2>>): Generator<T2> {
        // @ts-ignore
        return this.transform(transform);
    }

    filter(predicate: Predicate<T>) {
        return this.transform((iterable) =>
            Generator.filter(predicate, iterable)
        );
    }

    is = this.filter;

    isNot(element: T) {
        return this.filter((_element) => !Object.is(element, _element));
    }

    map<T2 = T>(transform: Transform<T, T2>) {
        return this.become((iterable) => Generator.map(transform, iterable));
    }

    cartesian_product<T2>(otherIterable: Iterable<T2>) {
        return this.become((iterable) =>
            Generator.cartesian_product(iterable, otherIterable)
        );
    }

    product = this.cartesian_product;

    chain<T2 = T>(...iterables: Array<Iterable<T2>>) {
        return this.become((iterable) =>
            Generator.chain<T | T2>(iterable, ...iterables)
        );
    }

    concat = this.chain;

    limit(n: number) {
        return this.transform((iterable) => Generator.limit(n, iterable));
    }

    combinations(k: number) {
        return this.become((iterable) => Generator.combinations(k, iterable));
    }

    prioritize<T2 = T>(
        prioritization: Prioritization<T2>,
        key?: Transform<T, T2>
    ) {
        return this.transform((iterable) =>
            Generator.prioritize(iterable, prioritization, key)
        );
    }

    take(n?: number): undefined | T | Array<T> {
        return Generator.take(n, this);
    }

    groupBy<T2 = T>(getGroup?: Transform<T, T2>): Map<T2, Array<T>> {
        return Generator.groupBy(this, getGroup);
    }
}
