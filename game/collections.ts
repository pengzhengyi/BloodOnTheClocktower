/* eslint-disable no-dupe-class-members */
import { Deque } from 'js-sdsl';
import type { RecoverableGameError, RecoveryAction } from './exception';
import type {
    AsyncPredicate,
    AsyncReducer,
    Factory,
    Loader,
    Predicate,
    Prioritization,
    Reducer,
    RejectCallback,
    ResolveCallback,
    StaticThis,
    Task,
    Transform,
} from './types';

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

    getOrDefault(key: K, defaultValue: V) {
        return super.get(key) ?? defaultValue;
    }
}

export class TaskQueue<T> {
    protected tasks: Deque<Promise<T>> = new Deque();

    protected pending: Deque<[ResolveCallback<T>, RejectCallback]> =
        new Deque();

    constructor(tasks?: Iterable<Promise<T>>) {
        if (tasks !== undefined) {
            this.enqueueAll(tasks);
        }
    }

    get numPending() {
        return this.pending.length;
    }

    get numFinished() {
        return this.numTasks - this.numPending;
    }

    get numTasks() {
        return this.tasks.length;
    }

    get isEmpty() {
        return this.numTasks === 0;
    }

    get isBusy() {
        return this.numPending > 0;
    }

    get isIdle() {
        return this.numPending === 0;
    }

    enqueue(task: Promise<T>) {
        this.addWorker();

        task.then((value) => {
            const [resolve, _reject] = this.pending.popFront()!;
            resolve(value);
        }).catch((reason) => {
            const [_resolve, reject] = this.pending.popFront()!;
            reject(reason);
        });
    }

    enqueueAll(tasks: Iterable<Promise<T>>) {
        for (const task of tasks) {
            this.enqueue(task);
        }
    }

    dequeue(): Promise<T> | undefined {
        if (this.isEmpty) {
            return;
        }

        return this.tasks.popFront();
    }

    protected addWorker() {
        this.tasks.pushBack(
            new Promise((resolve, reject) =>
                this.pending.pushBack([resolve, reject])
            )
        );
    }

    *[Symbol.iterator]() {
        while (!this.isEmpty) {
            yield this.dequeue()!;
        }
    }

    async *[Symbol.asyncIterator]() {
        while (!this.isEmpty) {
            yield await this.dequeue()!;
        }
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
    static *range(start: number, stop?: number, step = 1) {
        if (stop === undefined) {
            stop = start;
            start = 0;
        }

        for (let i = start; i < stop; i += step) {
            yield i;
        }
    }

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

    static filterAsync<T>(
        predicate: AsyncPredicate<T>,
        iterable: Iterable<T>
    ): Promise<Iterable<T>> {
        const promises = Generator.promiseAll(
            Generator.toPromise(
                async (element) =>
                    [element, await predicate(element)] as [T, boolean],
                iterable
            )
        );

        return promises.then((elementAndShouldKeeps) =>
            Generator.map(
                ([element, _shouldKeep]) => element,
                Generator.filter(
                    ([_element, shouldKeep]) => shouldKeep,
                    elementAndShouldKeeps
                )
            )
        );
    }

    static *exclude<T>(
        iterable: Iterable<T>,
        excluded: Iterable<T>
    ): Iterable<T> {
        let elementsToExclude: Set<T>;
        let done: boolean | undefined;
        let value: T | undefined;
        const iterator = excluded[Symbol.iterator]();

        if (excluded instanceof Set) {
            // short circuit for Set
            elementsToExclude = excluded;
            done = true;
        } else {
            ({ done, value } = iterator.next());
            elementsToExclude = new Set();
        }

        for (const element of iterable) {
            if (elementsToExclude.has(element)) {
                continue;
            }

            if (!done) {
                do {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    elementsToExclude.add(value!);
                    if (element === value) {
                        break;
                    } else {
                        ({ done, value } = iterator.next());
                    }
                } while (!done);
            }

            if (done) {
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

    static promiseAll<T>(iterable: Iterable<Promise<T>>) {
        return Promise.all(iterable);
    }

    static promiseAllSettled<T>(iterable: Iterable<Promise<T>>) {
        return Promise.allSettled(iterable);
    }

    static promiseAny<T>(iterable: Iterable<Promise<T>>) {
        return Promise.any(iterable);
    }

    static promiseRace<T>(iterable: Iterable<Promise<T>>) {
        return Promise.race(iterable);
    }

    static promiseRaceAll<T>(
        iterable: Iterable<Promise<T>>
    ): Iterable<Promise<T>> {
        return new TaskQueue(iterable);
    }

    static toPromise<T1, T2 = T1>(
        toPromise: Transform<T1, Promise<T2>>,
        iterable: Iterable<T1>
    ): Iterable<Promise<T2>>;

    static toPromise<T1, TError extends RecoverableGameError, T2 = T1>(
        toPromise: Transform<T1 | TError, Promise<T2>>,
        iterable: Iterable<T1 | TError>
    ): Iterable<Promise<T2>> {
        return Generator.map(toPromise, iterable);
    }

    static catch<
        T,
        TError extends RecoverableGameError,
        TErrorClassType extends typeof RecoverableGameError
    >(
        errorType: StaticThis<TError> & TErrorClassType,
        iterable: Iterable<T | TError>,
        recovery: RecoveryAction<TError, T>
    ): Iterable<Promise<T>> {
        const toPromise = (value: T | TError) =>
            value instanceof Error
                ? Promise.reject(value)
                : Promise.resolve(value);
        const promises = this.toPromise(toPromise, iterable) as Iterable<
            Promise<T>
        >;
        return this.catchAsync(errorType, promises, recovery);
    }

    static catchAsync<
        T,
        TError extends RecoverableGameError,
        TErrorClassType extends typeof RecoverableGameError
    >(
        errorType: StaticThis<TError> & TErrorClassType,
        iterable: Iterable<Promise<T>>,
        recovery: RecoveryAction<TError, T>
    ): Iterable<Promise<T>> {
        return this.map(
            (action) => errorType.catch<TError, T>(() => action, recovery),
            iterable
        );
    }

    static *promiseThen<T1, T2>(
        transform: Transform<T1, T2>,
        iterable: Iterable<Promise<T1>>
    ): Iterable<Promise<T2>> {
        for (const element of iterable) {
            yield element.then(transform);
        }
    }

    static promiseMap = this.promiseThen;

    static *map<T1, T2>(
        transform: Transform<T1, T2>,
        iterable: Iterable<T1>
    ): Iterable<T2> {
        for (const element of iterable) {
            yield transform(element);
        }
    }

    static reduce<T1, T2>(
        reducer: Reducer<T1, T2>,
        initialValue: T1,
        iterable: Iterable<T2>
    ): T1 {
        let reducedValue: T1 = initialValue;
        for (const element of iterable) {
            reducedValue = reducer(reducedValue, element);
        }
        return reducedValue;
    }

    static reduceAsync<T1, T2>(
        reducer: AsyncReducer<T1, T2>,
        initialValue: T1,
        iterable: Iterable<Promise<T2>>
    ): Promise<T1> {
        let reducedValue: Promise<T1> = Promise.resolve(initialValue);
        for (const element of iterable) {
            reducedValue = reducer(reducedValue, element);
        }
        return reducedValue;
    }

    static count<T>(iterable: Iterable<T>): number {
        let numElement = 0;
        for (const _ of iterable) {
            numElement++;
        }
        return numElement;
    }

    static *enumerate<T>(
        iterable: Iterable<T>,
        start = 0
    ): Iterable<[number, T]> {
        for (const element of iterable) {
            yield [start++, element];
        }
    }

    static *push<T>(iterable: Iterable<T>, ...items: T[]): Iterable<T> {
        for (const element of iterable) {
            yield element;
        }

        for (const element of items) {
            yield element;
        }
    }

    // TODO: submit bug report on Typescript
    static *orElse<T1, T2 = T1>(
        iterable: Iterable<T1>,
        defaultValue: T2
        // @ts-ignore: enforce type for orElse
    ): Iterable<T1> | Iterable<T2> {
        let hasElement = false;
        for (const element of iterable) {
            hasElement = true;
            yield element;
        }

        if (!hasElement) {
            yield defaultValue;
        }
    }

    static *pair<T1, T2>(
        iterable: Iterable<T1>,
        otherIterable: Iterable<T2>
    ): Iterable<[T1, T2]> {
        const iterator = otherIterable[Symbol.iterator]();
        for (const element of iterable) {
            const { done, value } = iterator.next();
            if (done) {
                return;
            }

            yield [element, value];
        }
    }

    static *replace<T>(
        iterable: Iterable<T>,
        isMatch: Predicate<T>,
        replacerFunction: Transform<T>
    ): Iterable<T> {
        for (const element of iterable) {
            if (isMatch(element)) {
                yield replacerFunction(element);
            } else {
                yield element;
            }
        }
    }

    static *zip<T>(iterables: Iterable<Iterable<T>>): Iterable<Array<T>> {
        const iterators = Generator.cache(iterables).map((iterable) =>
            iterable[Symbol.iterator]()
        );
        while (true) {
            const values = [];
            for (const { done, value } of Generator.map(
                (iterator) => iterator.next(),
                iterators
            )) {
                if (done) {
                    return;
                }
                values.push(value);
            }
            yield values;
        }
    }

    static *product<T>(iterables: Iterable<Iterable<T>>): Iterable<Array<T>> {
        let partialProducts: Array<Array<T>> = [];
        const iterators: Array<Iterator<T>> = [];

        const currentProduct: Array<T> = [];

        let iterator: Iterator<T>;
        for (const iterable of iterables) {
            iterator = iterable[Symbol.iterator]();
            iterators.push(iterator);
            const iteratorResult = iterator.next();
            if (iteratorResult.done) {
                return;
            }
            currentProduct.push(iteratorResult.value);
        }

        const numIterators = iterators.length;
        if (numIterators === 0) {
            return;
        }

        yield currentProduct;

        for (
            let iteratorIndex = numIterators - 1, atLastIterator = true;
            iteratorIndex >= 0;
            iteratorIndex--, atLastIterator = false
        ) {
            const iterator = iterators[iteratorIndex];
            const newPartialProducts: Array<Array<T>> = [];

            if (atLastIterator) {
                newPartialProducts.push(currentProduct.slice(-1));
            } else {
                const value = currentProduct[iteratorIndex];
                for (const partialProduct of partialProducts) {
                    newPartialProducts.push([value, ...partialProduct]);
                }
            }

            while (true) {
                const { done, value } = iterator.next();
                if (done) {
                    break;
                }

                const newProduct = currentProduct.slice(0, iteratorIndex);
                if (atLastIterator) {
                    newProduct.push(value);
                    newPartialProducts.push([value]);
                    yield newProduct;
                } else {
                    newProduct.push(value);

                    for (const partialProduct of partialProducts) {
                        newPartialProducts.push([value, ...partialProduct]);
                        yield [...newProduct, ...partialProduct];
                    }
                }
            }

            partialProducts = newPartialProducts;
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

    static chain<T = unknown>(...iterables: Array<Iterable<T>>): Iterable<T> {
        return this.chain_from_iterable(iterables);
    }

    static *chain_from_iterable<T = unknown>(
        iterables: Iterable<Iterable<T>>
    ): Iterable<T> {
        for (const iterable of iterables) {
            for (const element of iterable) {
                yield element;
            }
        }
    }

    static every<T>(predicate: Predicate<T>, iterable: Iterable<T>): boolean {
        for (const element of iterable) {
            if (!predicate(element)) {
                return false;
            }
        }

        return true;
    }

    static any<T>(predicate: Predicate<T>, iterable: Iterable<T>): boolean {
        for (const element of iterable) {
            if (predicate(element)) {
                return true;
            }
        }

        return false;
    }

    static forEach<T>(action: Task<T>, iterable: Iterable<T>): void {
        for (const element of iterable) {
            action(element);
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

    static cache<T>(iterable: Iterable<T>) {
        return new this(iterable, [], true);
    }

    cached?: Array<T>;

    private initialIterable: Iterable<T>;

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
                    this.cached?.push(element);
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
        this.initialIterable = iterable;
        this.iterable = iterable;
        this.transforms = transforms;
        this.supportMultipleIterations = supportMultipleIterations;
    }

    /**
     * Reset intends to un-apply all transforms so that the original iterable will directly be iterated.
     *
     * ! However, reset does not work in every scenario. For example, if the original iterable can only be iterated once and is currently iterated, reset will not restore it to before-iterated state.
     *
     * @returns Current generator with all transforms reset.
     */
    reset(): this {
        this.iterable = this.initialIterable;
        this.transforms = [];
        this.cached = undefined;
        return this;
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
        // @ts-ignore: force type conversion here instead of creating a new instance
        return this.transform(transform);
    }

    transmute<T2, G>(transform: Transform<Iterable<T>, T2>): G {
        // @ts-ignore: force type conversion here instead of creating a new instance
        return this.transform(transform);
    }

    filter(predicate: Predicate<T>) {
        return this.transform((iterable) =>
            Generator.filter(predicate, iterable)
        );
    }

    filterAsync(predicate: AsyncPredicate<T>) {
        return Generator.filterAsync(predicate, this);
    }

    is = this.filter;

    isNot(element: T) {
        return this.filter((_element) => !Object.is(element, _element));
    }

    replace(isMatch: Predicate<T>, replacerFunction: Transform<T>) {
        return this.transform((iterable) =>
            Generator.replace(iterable, isMatch, replacerFunction)
        );
    }

    exclude(excluded: Iterable<T>) {
        return this.transform((iterable) =>
            Generator.exclude(iterable, excluded)
        );
    }

    promiseAll<T1>(this: Generator<Promise<T1>>) {
        return Generator.promiseAll(this);
    }

    promiseAllSettled<T1>(this: Generator<Promise<T1>>) {
        return Generator.promiseAllSettled(this);
    }

    promiseAny<T1>(this: Generator<Promise<T1>>) {
        return Generator.promiseAny(this);
    }

    promiseRace<T1>(this: Generator<Promise<T1>>) {
        return Generator.promiseRace(this);
    }

    promiseRaceAll<T1>(this: Generator<Promise<T1>>) {
        return this.become((iterable) => Generator.promiseRaceAll(iterable));
    }

    toPromise<T2 = T>(toPromise: Transform<T, Promise<T2>>) {
        return this.become((iterable) =>
            Generator.toPromise(toPromise, iterable)
        );
    }

    catch<
        TResult,
        TError extends RecoverableGameError,
        TErrorClassType extends typeof RecoverableGameError
    >(
        this: Generator<TResult | TError>,
        errorType: StaticThis<TError> & TErrorClassType,
        recovery: RecoveryAction<TError, TResult>
    ) {
        return this.become((iterable) =>
            Generator.catch(errorType, iterable, recovery)
        );
    }

    catchAsync<
        TResult,
        TError extends RecoverableGameError,
        TErrorClassType extends typeof RecoverableGameError
    >(
        this: Generator<Promise<TResult>>,
        errorType: StaticThis<TError> & TErrorClassType,
        recovery: RecoveryAction<TError, TResult>
    ) {
        return this.become((iterable) =>
            Generator.catchAsync(errorType, iterable, recovery)
        );
    }

    promiseThen<T1, T2>(
        this: Generator<Promise<T1>>,
        transform: Transform<T1, T2>
    ) {
        return this.become((iterable) =>
            Generator.promiseThen(transform, iterable)
        );
    }

    mapAsync = this.promiseThen;

    map<T2 = T>(transform: Transform<T, T2>) {
        return this.become((iterable) => Generator.map(transform, iterable));
    }

    enumerate(start = 0) {
        return this.become((iterable) => Generator.enumerate(iterable, start));
    }

    push(...items: T[]) {
        return this.transform((iterable) => Generator.push(iterable, ...items));
    }

    orElse<T2 = T>(defaultValue: T2) {
        return this.transmute<
            Iterable<T> | Iterable<T2>,
            Generator<T> | Generator<T2>
        >((iterable) => Generator.orElse<T, T2>(iterable, defaultValue));
    }

    pair<T2>(otherIterable: Iterable<T2>) {
        return this.become((iterable) =>
            Generator.pair(iterable, otherIterable)
        );
    }

    zip<T2 = T>(iterables: Iterable<Iterable<T2>>) {
        return this.become((iterable) =>
            Generator.zip<T | T2>(
                (function* () {
                    yield iterable;
                    yield* iterables;
                })()
            )
        );
    }

    cartesian_product<T2>(otherIterable: Iterable<T2>) {
        return this.become((iterable) =>
            Generator.cartesian_product(iterable, otherIterable)
        );
    }

    product<T2 = T>(
        iterables: Iterable<Iterable<T2>>
    ): Iterable<Array<T2 | T>> {
        return this.become((iterable) =>
            Generator.product<T2 | T>(
                (function* () {
                    yield iterable;
                    yield* iterables;
                })()
            )
        );
    }

    chain<T2 = T>(...iterables: Array<Iterable<T2>>) {
        return this.become((iterable) =>
            Generator.chain<T | T2>(iterable, ...iterables)
        );
    }

    chain_from_iterable<T2 = T>(iterables: Iterable<Iterable<T2>>) {
        return this.become((iterable) =>
            Generator.chain_from_iterable<T | T2>(
                (function* () {
                    yield iterable;
                    yield* iterables;
                })()
            )
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

    count(): number {
        return Generator.count(this);
    }

    groupBy<T2 = T>(getGroup?: Transform<T, T2>): Map<T2, Array<T>> {
        return Generator.groupBy(this, getGroup);
    }

    forEach(action: Task<T>): void {
        Generator.forEach(action, this);
    }

    every(predicate: Predicate<T>): boolean {
        return Generator.every(predicate, this);
    }

    any(predicate: Predicate<T>): boolean {
        return Generator.any(predicate, this);
    }

    reduce<T1>(reducer: Reducer<T1, T>, initialValue: T1): T1 {
        return Generator.reduce(reducer, initialValue, this);
    }

    reduceAsync<T1>(
        this: Generator<Promise<T>>,
        reducer: AsyncReducer<T1, T>,
        initialValue: T1
    ): Promise<T1> {
        return Generator.reduceAsync(reducer, initialValue, this);
    }
}

export type CachingGenerator<T> = Generator<T> & {
    supportMultipleIterations: true;
};
