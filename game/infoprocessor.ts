import { GameInfo } from './gameinfo';

export interface Context {
    unbiasedGameInfo: GameInfo;
    reason?: string;
}

/**
 * Process (or possibly modify) game information.
 */
export interface InfoProcessor {
    isEligible(_gameState: GameInfo): Promise<boolean>;

    apply(gameInfo: GameInfo, context: Context): Promise<GameInfo>;
}
