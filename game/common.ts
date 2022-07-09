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
