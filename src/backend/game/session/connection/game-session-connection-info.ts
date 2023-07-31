import type { IGameSessionConnectionRequest } from './game-session-connection-request';
import type { IGameSessionConnectionResponse } from './game-session-connection-response';

/**
 * The connection information for a game session.
 */
export interface IGameSessionConnectionInfo {
    readonly isAcceptingConnection: boolean;

    verify(
        request: IGameSessionConnectionRequest
    ): Promise<IGameSessionConnectionResponse>;
}
