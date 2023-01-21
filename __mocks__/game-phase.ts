import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue } from './common';
import { GamePhase, IGamePhase } from '~/game/game-phase';
import type { Phase } from '~/game/phase';

export function mockGamePhase(): GamePhase {
    return mock<GamePhase>();
}

export function createGamePhase(phaseCounter: number): GamePhase {
    return GamePhase.of(phaseCounter);
}

export function mockGamePhaseAtPhase(phase: Phase): IGamePhase {
    return mockWithPropertyValue<IGamePhase, number>('phase', phase);
}
