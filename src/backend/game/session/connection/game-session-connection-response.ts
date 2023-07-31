import type { IStatus } from '../../../common/utils/status';
import type { IGameSessionConnectionRequest } from './game-session-connection-request';

/**
 * The validation status of a connection request to a game session.
 */
export interface IGameSessionConnectionResponse extends IStatus {
    readonly request: IGameSessionConnectionRequest;
}
