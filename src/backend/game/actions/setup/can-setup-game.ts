import type { ISetupGameRequest } from './setup-game-request';
import type { ISetupGameResponse } from './setup-game-response';

export interface CanSetupGame {
    setupGame(request: ISetupGameRequest): Promise<ISetupGameResponse>;
}
