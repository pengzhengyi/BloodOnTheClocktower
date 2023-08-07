import type { IResponse } from '../../../common/interfaces/response';
import type { IGameSessionJoinRequest } from './game-session-join-request';

export interface IGameSessionJoinResponse
    extends IResponse<IGameSessionJoinRequest> {}
