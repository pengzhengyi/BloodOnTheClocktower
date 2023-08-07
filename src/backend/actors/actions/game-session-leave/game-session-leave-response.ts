import type { IResponse } from '../../../common/interfaces/response';
import type { IGameSessionLeaveRequest } from './game-session-leave-request';

export interface IGameSessionLeaveResponse
    extends IResponse<IGameSessionLeaveRequest> {}
