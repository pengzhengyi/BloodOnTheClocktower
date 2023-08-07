import type { Moment } from '../utils/moment';

/**
 * Interface for objects that have a timestamp.
 */
export interface WithTimestamp {
    readonly timestamp: Moment;
}
