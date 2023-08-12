import type { IAbortGameRequest } from './abort-game-request';
import type { IAbortGameResponse } from './abort-game-response';

export interface CanAbortGame {
    abortGame(request: IAbortGameRequest): Promise<IAbortGameResponse>;
}
