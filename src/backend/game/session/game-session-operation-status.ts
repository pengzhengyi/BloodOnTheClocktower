import type { WithStatus } from '../../common/interfaces/with-status';
import type { IGameSession } from './game-session';
import type { GameSessionOperationType } from './game-session-operation-type';

export interface IGameSessionOperationStatus extends WithStatus {
    readonly type: GameSessionOperationType;

    readonly gameSession?: IGameSession;
}
