import { binarySearch } from './common';
import { Moment } from './moment';
import type { IToll } from './toll';

/**
 * A Chronology represents a series of tolls. It supports repeated iterations of tolls from earliest to latest or tolls within a given duration.
 */
export interface IChronology<T> extends Iterable<IToll<T>> {
    add(toll: IToll<T>): void;

    /**
     * Rewind through a duration (defined by start exclusively and end inclusively) to iteratively return tolls inside this duration (from earliest to latest).
     *
     * @param start A timestamp to begin search, only tolls after start will be included. When not provided, there is no constraint for start time.
     * @param end A timestamp to finish search, only tolls before or same as end will be included.  When not provided, there is no constraint for end time.
     * @returns The tolls within defined duration from earliest to latest.
     */
    rewind(start?: Moment, end?: Moment): Iterable<IToll<T>>;
}

export class Chronology<T> implements IChronology<T> {
    protected readonly tolls: Array<IToll<T>> = [];

    [Symbol.iterator](): Iterator<IToll<T>> {
        return this.tolls[Symbol.iterator]();
    }

    add(toll: IToll<T>) {
        let indexToInsertAfter = this.tolls.length - 1;
        for (; indexToInsertAfter >= 0; indexToInsertAfter--) {
            const existingToll = this.tolls[indexToInsertAfter];
            if (toll.isBefore(existingToll)) {
                continue;
            } else {
                break;
            }
        }

        this.tolls.splice(indexToInsertAfter + 1, 0, toll);
    }

    *rewind(start?: Moment, end?: Moment): Iterable<IToll<T>> {
        const startIndexExclusive =
            start === undefined
                ? -1
                : binarySearch(this.tolls, (toll) => toll.when.isBefore(start));
        const endIndexInclusive =
            end === undefined
                ? this.tolls.length - 1
                : binarySearch(this.tolls, (toll) =>
                      toll.when.isSameOrBefore(end)
                  );

        for (let i = startIndexExclusive + 1; i <= endIndexInclusive; i++) {
            yield this.tolls[i];
        }
    }
}
