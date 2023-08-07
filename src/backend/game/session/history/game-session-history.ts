import type { Moment } from '../../../common/utils/moment';
import type { IGame } from '../../game';

/**
 * The game history of a game session. It allows for the time-based retrieval of games.
 */
export interface IGameHistory {
    readonly games: IGame[];

    hasOngoingGame(): boolean;

    /**
     * Gets the games in the specified time range.
     *
     * @param startTime The start time of the time range. When this is not specified, the start time is assumed to be the beginning of time.
     * @param endTime The end time of the time range. When this is not specified, the end time is assumed to be the end of time.
     * @param timeRangeEndianHandling The endian handling of the time range. When this is not specified, the time range is assumed to be inclusive at both ends.
     */
    getGamesInTimeRange(
        startTime?: Moment,
        endTime?: Moment,
        timeRangeEndianHandling?: number
    ): IGame[];

    getMostRecentGame(): IGame | undefined;

    getOngoingGame(): IGame | undefined;
}
