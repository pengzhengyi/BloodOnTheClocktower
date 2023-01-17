import { mock } from 'jest-mock-extended';
import { GamePhase } from '~/game/game-phase';

export function mockGamePhase(): GamePhase {
    return mock<GamePhase>();
}

export function createGamePhase(phaseCounter: number): GamePhase {
    return GamePhase.of(phaseCounter);
}
