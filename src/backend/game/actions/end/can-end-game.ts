import type { IEndGameRequest } from './end-game-request';
import type { IEndGameResponse } from './end-game-response';

export interface CanEndGame {
    endGame(request: IEndGameRequest): Promise<IEndGameResponse>;
}
