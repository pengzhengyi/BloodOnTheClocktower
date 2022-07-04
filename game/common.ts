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

    for (let index = 0; index < startIndex; index++) {
        yield elements[index];
    }
}
