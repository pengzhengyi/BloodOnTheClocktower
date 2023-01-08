import { mock } from 'jest-mock-extended';
import { mockCharacterSheet } from './charactersheet';
import { mockGame } from './game';
import { mockInfoProvideContext as _mockInfoProvideContext } from './information';
import { mockNightSheet } from './nightsheet';
import type {
    AbilitySetupContext,
    AbilityUseContext,
    GetInfoAbilityUseContext,
    MayorAbilitySetupContext,
    VirginAbilityUseContext,
} from '~/game/ability';
import type { Player } from '~/game/player';
import type { Players } from '~/game/players';
import type { Task } from '~/game/types';
import type { InfoProvideContext } from '~/game/infoprovider';
import type { Execution } from '~/game/execution';
import type { Game } from '~/game/game';
import type { NightSheet } from '~/game/nightsheet';
import type { CharacterSheet } from '~/game/charactersheet';

export function mockAbilityUseContext(
    player?: Player,
    players?: Players
): AbilityUseContext {
    return {
        requestedPlayer: player ?? mock<Player>(),
        players: players ?? mock<Players>(),
    };
}

export function mockAbilitySetupContext(
    player?: Player,
    players?: Players,
    context?: AbilityUseContext,
    nightSheet?: NightSheet
): AbilitySetupContext {
    if (context === undefined) {
        context = mockAbilityUseContext(player, players);
    }

    (context as AbilitySetupContext).nightSheet =
        nightSheet ?? mockNightSheet();

    return context as AbilitySetupContext;
}

export function mockGetInfoAbilityUseContext(
    mockInfoProvideContext: () => InfoProvideContext = _mockInfoProvideContext,
    contextModifications: Array<Task<GetInfoAbilityUseContext>> = []
): GetInfoAbilityUseContext {
    const context = Object.assign(
        {},
        mockAbilityUseContext(),
        mockInfoProvideContext()
    );
    contextModifications.forEach((modification) => modification(context));
    return context;
}

export function mockVirginAbilityUseContext(
    player?: Player,
    execution?: Execution
): VirginAbilityUseContext {
    return Object.assign({}, mockAbilityUseContext(player), {
        execution: execution ?? mock<Execution>(),
    });
}

export function mockMayorAbilitySetupContext(
    player?: Player,
    players?: Players,
    game?: Game,
    nightSheet?: NightSheet,
    characterSheet?: CharacterSheet
): MayorAbilitySetupContext {
    return Object.assign({}, mockAbilityUseContext(player, players), {
        game: game ?? mockGame(),
        nightSheet: nightSheet ?? mockNightSheet(),
        characterSheet: characterSheet ?? mockCharacterSheet(),
    });
}
