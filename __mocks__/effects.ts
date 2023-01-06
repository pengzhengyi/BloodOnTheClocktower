import { mockGamePhase } from './gamephase';
import { Effects } from '~/game/effects';
import type { GamePhase } from '~/game/gamephase';

export function setupEffects(gamePhase?: GamePhase, force = false) {
    if (Effects.gamePhase === undefined || force) {
        Effects.gamePhase = gamePhase ?? mockGamePhase();
    }
}
