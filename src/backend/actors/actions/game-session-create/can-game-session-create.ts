import type { IGameSessionCreateRequest } from './game-session-create-request';
import type { IGameSessionCreateResponse } from './game-session-create-response';

export interface CanGameSessionCreate {
    gameSessionCreate(
        request: IGameSessionCreateRequest
    ): Promise<IGameSessionCreateResponse>;
}
