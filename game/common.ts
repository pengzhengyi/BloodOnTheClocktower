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
