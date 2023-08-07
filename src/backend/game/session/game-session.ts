import type { IGameSessionConnectionInfo } from './connection/game-session-connection-info';
import type { IGameSessionInfo } from './game-session-info';
import type { IGameSessionOperationStatus } from './game-session-operation-status';
import type { IGameHistory } from './history/game-session-history';

/**
 * A game session is established by a host and can contain multiple games.
 */
export interface IGameSession {
    readonly info: IGameSessionInfo;
    readonly connectionInfo: IGameSessionConnectionInfo;

    readonly history: IGameHistory;

    createGame(): Promise<IGameSessionOperationStatus>;

    end(): Promise<IGameSessionOperationStatus>;
}
