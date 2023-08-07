import type { Duration, Moment } from '../utils/moment';

/**
 * This interface is used to represent an event that is either ongoing or has ended.
 */
export interface ITimeEvent {
    readonly createdAt: Moment;
    readonly endedAt?: Moment;

    readonly isAlive: boolean;
    readonly isClosed: boolean;

    /**
     * The duration of time that this event has been alive.
     *
     * When the event is closed, this is the duration of time that the event was alive. When the event is still alive, this is the duration of time that the event has been alive.
     */
    readonly aliveFor: Duration;
}
