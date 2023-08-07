import type { IResponse } from '../../../common/interfaces/response';
import type { IGameSessionConnectionRequest } from './game-session-connection-request';

/**
 * The validation status of a connection request to a game session.
 */
export interface IGameSessionConnectionResponse
    extends IResponse<IGameSessionConnectionRequest> {}
