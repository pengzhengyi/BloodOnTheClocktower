/** @deprecated */

import type { GameInfo } from './gameinfo';
import type { Phase } from './gamephase';

export interface Context {
    unbiasedGameInfo: GameInfo;
    reason?: string;
}

/**
 * Process (or possibly modify) game information.
 */
export interface InfoProcessor {
    applicablePhases: number | Phase;

    isEligible(_gameState: GameInfo): Promise<boolean>;

    apply(gameInfo: GameInfo, context: Context): Promise<GameInfo>;
}
