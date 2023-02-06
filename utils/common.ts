export function isIterable<T>(obj: unknown): obj is Iterable<T> {
    if (obj == null || obj === undefined) {
        return false;
    }

    return typeof (obj as Iterable<T>)[Symbol.iterator] === 'function';
}

export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
    if (obj == null || obj === undefined) {
        return false;
    }

    return (
        typeof (obj as AsyncIterable<T>)[Symbol.asyncIterator] === 'function'
    );
}

export function isString(obj: unknown): obj is string {
    return typeof obj === 'string' || obj instanceof String;
}

/**
 * Create a nice string represent of iterable.
 *
 * The template looks like:
 *
 * ```
 * <name>:
 *   |  <element 0>
 *   |  <element 1>
 *   ...
 *   |  <element n-1>
 *   |  <element n>
 * ```
 */
export function iterableToString<T>(
    iterable: Iterable<T>,
    name?: string,
    branchSymbol = '|',
    spacesBeforeBranchSymbol = 2,
    spacesAfterBranchSymbol = 2
): string {
    const branchNotation =
        ' '.repeat(spacesBeforeBranchSymbol) +
        branchSymbol +
        ' '.repeat(spacesAfterBranchSymbol);
    const header = name === undefined ? '' : `${name}:\n`;
    const elements = Array.from(iterable);
    const elementsStr = elements
        .map((element) => `${branchNotation}${element}`)
        .join('\n');
    return header + elementsStr;
}
