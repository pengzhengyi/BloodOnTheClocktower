import type { ISingleton, Predicate, NoParamConstructor } from './types';

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

export function parsePromiseSettledResults<T, E = typeof Error>(
    results: Array<PromiseSettledResult<T>>,
    errorHandler?: (errors: Array<E>, values: Array<T>) => void
): Array<T> {
    const values = [];
    const errors = [];
    for (const result of results) {
        if (result.status === 'fulfilled') {
            values.push(result.value);
        } else {
            errors.push(result.reason);
        }
    }

    if (errors.length > 0 && errorHandler !== undefined) {
        errorHandler(errors, values);
    }

    return values;
}

const regex = /[^a-z]/gi;

export function onlyLetters(s: string) {
    return s.replace(regex, '');
}

export function lowercaseLetters(s: string) {
    return s.toLowerCase().replace(regex, '');
}

export function randomChoice<T>(elements: Array<T>): T {
    return elements[Math.floor(Math.random() * elements.length)];
}

export function shuffle<T>(elements: Iterable<T>): Array<T> {
    const elementsWithPriority: Array<{ value: T; priority: number }> = [];

    for (const value of elements) {
        elementsWithPriority.push({
            value,
            priority: Math.random(),
        });
    }

    elementsWithPriority.sort(
        (elementWithPriority, otherElementWithPriority) =>
            elementWithPriority.priority - otherElementWithPriority.priority
    );
    return elementsWithPriority.map(({ value }) => value);
}

/**
 * Binary search through existing tolls to find an index where the toll at this index has the predicate evaluates to true while the toll at next index has the predicate evaluates to false.
 *
 * @example
 * find index of last element less than 2
 *    @
 * -1 0 1 2 3 4
 *  [ 1 3 6 9 ]
 *
 * find index of last element less than 0
 *  @
 * -1 0 1 2 3 4
 *  [ 1 3 6 9 ]
 *
 * find index of last element less than 100
 *          @
 * -1 0 1 2 3 4
 *  [ 1 3 6 9 ]
 *
 * find index of last element less than or equal with 6
 *        @
 * -1 0 1 2 3 4
 *  [ 1 3 6 9 ]
 *
 * @param predicate A boolean predicate on the toll.
 * @returns An index where the toll at this index has the predicate evaluates to true while the toll at next index has the predicate evaluates to false.
 */
export function binarySearch<T>(
    elements: Array<T>,
    predicate: Predicate<T>
): number {
    let start = 0;
    let end = elements.length - 1;
    let index: number;

    while (start <= end) {
        index = Math.floor((start + end) / 2);
        const toll = elements[index];
        if (predicate(toll)) {
            start = index + 1;
        } else {
            end = index - 1;
        }
    }

    return end;
}

export function Singleton<
    T extends object,
    TClass extends NoParamConstructor<T> = NoParamConstructor<T>
>(ClassConstructor: TClass): ISingleton<T> & Omit<TClass, 'new'> {
    // @ts-ignore: force type conversion with singleton pattern
    return class Singleton extends ClassConstructor {
        static getInstance() {
            if (this._instance === undefined) {
                this._instance = new this() as T;
            }

            return this._instance;
        }

        protected static _instance?: T;

        // eslint-disable-next-line no-useless-constructor
        protected constructor() {
            super();
        }
    };
}
