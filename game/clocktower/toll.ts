import dayjs from 'dayjs';
import { type Moment, moment } from '../../utils/moment';

/**
 * A toll is a combination of something to record and a timestamp. For example, record player has been killed at third night.
 *
 * Tolls can be compared with using `isBefore` and `isAfter`.
 */
export interface IToll<T> {
    /** A timestamp */
    readonly when: Moment;

    /** The reason why this toll is created. */
    readonly forWhat: T;

    isBefore<U = T>(other: IToll<U>): boolean;

    isAfter<U = T>(other: IToll<U>): boolean;
}

export class Toll<T> implements IToll<T> {
    readonly when: Moment;

    readonly forWhat: T;

    constructor(forWhat: T, timestamp?: number | Moment) {
        if (timestamp instanceof dayjs) {
            this.when = timestamp as Moment;
        } else {
            this.when = moment(timestamp as number | undefined);
        }

        this.forWhat = forWhat;
    }

    isBefore<U = T>(other: Toll<U>): boolean {
        return this.when.isBefore(other.when);
    }

    isAfter<U = T>(other: Toll<U>): boolean {
        return this.when.isAfter(other.when);
    }
}
