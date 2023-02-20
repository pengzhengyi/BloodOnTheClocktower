import fs, { promises as afs } from 'fs';
import type { TJSON } from '~/game/types';

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

export function getRandomCryptoIntInclusive(min: number, max: number): number {
    const range = max - min + 1;
    if (range <= 0) {
        throw new Error('max must be larger than min');
    }

    const requestBytes = Math.ceil(Math.log2(range) / 8);
    if (!requestBytes) {
        // No randomness required
        return min;
    }

    const maxNum = Math.pow(256, requestBytes);
    const cryptoBytes = new Uint8Array(requestBytes);

    while (true) {
        window.crypto.getRandomValues(cryptoBytes);

        let val = 0;
        for (let i = 0; i < requestBytes; i++) {
            val = (val << 8) + cryptoBytes[i];
        }

        if (val < maxNum - (maxNum % range)) {
            return min + (val % range);
        }
    }
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

export interface ILocalFileReader<TOut> {
    read(filepath: string): TOut;

    readAsync(filepath: string): Promise<TOut>;
}

export class LocalFileReader implements ILocalFileReader<string> {
    // eslint-disable-next-line no-useless-constructor
    constructor(protected readonly encoding: BufferEncoding = 'utf-8') {}

    read(filepath: string) {
        return fs.readFileSync(filepath, { encoding: this.encoding });
    }

    readAsync(filepath: string): Promise<string> {
        return afs.readFile(filepath, { encoding: this.encoding });
    }
}

export class LocalJSONReader<TOut = TJSON> implements ILocalFileReader<TOut> {
    protected readonly fileReader: ILocalFileReader<string>;

    constructor(fileReader?: ILocalFileReader<string>) {
        this.fileReader = fileReader ?? new LocalFileReader();
    }

    read(filepath: string): TOut {
        const jsonStr = this.fileReader.read(filepath);
        const json = JSON.parse(jsonStr);
        return json;
    }

    async readAsync(filepath: string): Promise<TOut> {
        const jsonStr = await this.fileReader.readAsync(filepath);
        const json = JSON.parse(jsonStr);
        return json;
    }
}
