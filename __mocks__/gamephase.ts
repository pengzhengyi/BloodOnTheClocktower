import { mock } from 'jest-mock-extended';
import type { GamePhase } from '~/game/gamephase';

export function mockGamePhase(): GamePhase {
    return mock<GamePhase>();
}
