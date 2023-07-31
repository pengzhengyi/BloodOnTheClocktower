import type { IGameSessionInitializationConfigs } from './game-session-initialization-configs';
import type { IGameSessionOperationStatus } from './game-session-operation-status';

/**
 * GameSessions represents a manager of game sessions.
 *
 * It allows for the creation of new game sessions and the retrieval of existing game sessions.
 *
 * Note that the game session is not necessarily local -- it can as well be a proxy of a remotely running game session.
 */
export interface IGameSessions {
    create(
        configs?: IGameSessionInitializationConfigs
    ): Promise<IGameSessionOperationStatus>;

    findById(gameSessionId: string): Promise<IGameSessionOperationStatus>;
}
