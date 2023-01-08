import { createGamePhase, mockGamePhase } from './gamephase';
import { Effects } from '~/game/effects';
import type { GamePhase } from '~/game/gamephase';
import { Action } from '~/game/types';

export function setupEffects(gamePhase?: GamePhase, force = false) {
    if (Effects.gamePhase === undefined || force) {
        Effects.gamePhase = gamePhase ?? mockGamePhase();
    }
}

export type TRecoverGamePhase = Action;

export function mockGamePhaseTemporarily(
    phaseCounter: number
): [GamePhase, TRecoverGamePhase] {
    const originGamePhase = Effects.gamePhase;
    const gamePhase = createGamePhase(phaseCounter);
    Effects.gamePhase = gamePhase;

    return [
        gamePhase,
        () => {
            Effects.gamePhase = originGamePhase;
        },
    ];
}
