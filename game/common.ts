import { Predicate, Transform } from './types';

/**
 * Iterate from the element at specified index to last element and then from first element to the last element before specified index.
 * @param elements - An array of elements.
 * @param startIndex - An index in that array. The element at specified index will be iterated first.
 */
export function* clockwise<T>(
    elements: Array<T>,
    startIndex: number
): IterableIterator<T> {
    const numElements = elements.length;
    for (let index = Math.max(0, startIndex); index < numElements; index++) {
        yield elements[index];
    }

    for (let index = 0; index < startIndex && index < numElements; index++) {
        yield elements[index];
    }
}

/**
 * Iterate from the element at specified index to first element and then from last element to the next element after specified index.
 * @param elements - An array of elements.
 * @param startIndex - An index in that array. The element at specified index will be iterated first.
 */
export function* counterclockwise<T>(
    elements: Array<T>,
    startIndex: number
): IterableIterator<T> {
    const lastIndex = elements.length - 1;
    for (let index = Math.min(startIndex, lastIndex); index >= 0; index--) {
        yield elements[index];
    }

    for (let index = lastIndex; index > startIndex && index >= 0; index--) {
        yield elements[index];
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
        readonly transforms: Array<Transform<Iterable<T>>> = [],
        readonly supportMultipleIterations: boolean = true
    ) {
        this.iterable = iterable;
        this.transforms = transforms;
        this.supportMultipleIterations = supportMultipleIterations;
    }

    transform(transform: Transform<Iterable<T>>): Generator<T> {
        if (this.supportMultipleIterations && this.cached !== undefined) {
            // result already iterated, create new generator instead
            return new Generator(
                this.cached,
                [transform],
                this.supportMultipleIterations
            );
        }

        this.transforms.push(transform);
        return this;
    }

    filter(predicate: Predicate<T>): Generator<T> {
        return this.transform((iterable) =>
            Generator.filter(predicate, iterable)
        );
    }

    is = this.filter;

    isNot(element: T): Generator<T> {
        return this.filter((_element) => !Object.is(element, _element));
    }

    map<T2 = T>(transform: Transform<T, T2>): Generator<T2> {
        // @ts-ignore
        return this.transform((iterable) => Generator.map(transform, iterable));
    }

    cartesian_product<T2>(otherIterable: Iterable<T2>): Generator<[T, T2]> {
        // @ts-ignore
        return this.transform((iterable) =>
            Generator.cartesian_product(iterable, otherIterable)
        );
    }

    product = this.cartesian_product;

    chain<T2 = T>(...iterables: Array<Iterable<T2>>): Generator<T2> {
        // @ts-ignore
        return this.transform((iterable) =>
            Generator.chain(iterable, ...iterables)
        );
    }

    concat = this.chain;

    combinations(k: number): Generator<Array<T>> {
        // @ts-ignore
        return this.transform((iterable) =>
            Generator.combinations(k, iterable)
        );
    }

    limit(n: number): Generator<T> {
        return this.transform((iterable) => Generator.limit(n, iterable));
    }

    take(n?: number): undefined | T | Array<T> {
        return Generator.take(n, this);
    }
}
