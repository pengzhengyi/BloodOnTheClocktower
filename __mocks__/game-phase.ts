import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue, mockWithPropertyValues } from './common';
import { GamePhase, type IGamePhase } from '~/game/game-phase';
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

export function mockGamePhaseForNight(
    isNonfirstNight: boolean,
    isNight = true
): IGamePhase {
    if (isNonfirstNight) {
        return mockWithPropertyValues<IGamePhase, [boolean, boolean, boolean]>(
            ['isNonfirstNight', 'isFirstNight', 'isNight'],
            [true, false, isNight]
        );
    } else {
        return mockWithPropertyValues<IGamePhase, [boolean, boolean, boolean]>(
            ['isNonfirstNight', 'isFirstNight', 'isNight'],
            [false, true, isNight]
        );
    }
}

export function mockGamePhaseForDay(): IGamePhase {
    return mockWithPropertyValues<IGamePhase, [boolean, boolean, boolean]>(
        ['isNonfirstNight', 'isFirstNight', 'isNight'],
        [false, false, false]
    );
}
