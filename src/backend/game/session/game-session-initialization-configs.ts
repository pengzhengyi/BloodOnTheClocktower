import type { IGameSessionConnectionInitializationConfigs } from './connection/game-session-connection-initialization-configs';

/**
 * Game session initialization configs.
 */
export interface IGameSessionInitializationConfigs {
    connection: IGameSessionConnectionInitializationConfigs;
}
