import type { IGameSessionConnectionInfo } from './connection/game-session-connection-info';
import type { IGameSessionInfo } from './game-session-info';
import type { IGameSessionOperationStatus } from './game-session-operation-status';

/**
 * A game session is established by a host and can contain multiple games.
 */
export interface IGameSession {
    readonly info: IGameSessionInfo;
    readonly connectionInfo: IGameSessionConnectionInfo;

    end(): Promise<IGameSessionOperationStatus>;
}
