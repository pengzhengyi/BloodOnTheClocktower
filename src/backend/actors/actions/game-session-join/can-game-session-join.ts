import type { IGameSessionJoinRequest } from './game-session-join-request';
import type { IGameSessionJoinResponse } from './game-session-join-response';

export interface CanGameSessionJoin {
    gameSessionJoin(
        request: IGameSessionJoinRequest
    ): Promise<IGameSessionJoinResponse>;
}
