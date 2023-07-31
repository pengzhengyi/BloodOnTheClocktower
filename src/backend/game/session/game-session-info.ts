import type { Duration, Moment } from '../../common/utils/moment';

/**
 * Basic information of a game session.
 */
export interface IGameSessionInfo {
    readonly id: string;

    readonly createdAt: Moment;
    closedAt?: Moment;
    readonly isAlive: boolean;
    readonly isClosed: boolean;
    readonly aliveFor: Duration;
}
