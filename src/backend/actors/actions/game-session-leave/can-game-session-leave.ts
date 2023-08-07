import type { IGameSessionLeaveRequest } from './game-session-leave-request';
import type { IGameSessionLeaveResponse } from './game-session-leave-response';

export interface CanGameSessionLeave {
    gameSessionLeave(
        request: IGameSessionLeaveRequest
    ): Promise<IGameSessionLeaveResponse>;
}
