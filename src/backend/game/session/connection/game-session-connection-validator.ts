import type { IGameSessionConnectionRequest } from './game-session-connection-request';
import type { IGameSessionConnectionResponse } from './game-session-connection-response';
import type { GameSessionConnectionFlag } from './game-session-connection-flags';

/**
 * The validator that verifies connections to a game session.
 */
export interface IGameSessionConnectionValidator {
    readonly connectionFlags: Array<GameSessionConnectionFlag>;

    verify(
        request: IGameSessionConnectionRequest
    ): Promise<IGameSessionConnectionResponse>;
}
