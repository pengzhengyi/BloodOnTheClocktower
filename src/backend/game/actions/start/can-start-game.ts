import type { IStartGameRequest } from './start-game-request';
import type { IStartGameResponse } from './start-game-response';

export interface CanStartGame {
    startGame(request: IStartGameRequest): Promise<IStartGameResponse>;
}
