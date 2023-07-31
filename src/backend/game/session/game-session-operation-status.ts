import type { IStatus } from '../../common/utils/status';
import type { IGameSession } from './game-session';
import type { GameSessionOperationType } from './game-session-operation-type';

export interface IGameSessionOperationStatus extends IStatus {
    readonly type: GameSessionOperationType;

    readonly gameSession?: IGameSession;
}
