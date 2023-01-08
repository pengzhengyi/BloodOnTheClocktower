import { mock } from 'jest-mock-extended';
import { GamePhase } from '~/game/gamephase';

export function mockGamePhase(): GamePhase {
    return mock<GamePhase>();
}

export function createGamePhase(phaseCounter: number): GamePhase {
    return GamePhase.of(phaseCounter);
}
