import type { IRequest } from '../../../common/interfaces/request';

/**
 * Request to connect to a game session.
 */
export interface IGameSessionConnectionRequest extends IRequest {
    readonly gameSessionId: string;

    readonly data: Map<string, string>;
}
