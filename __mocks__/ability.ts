import { mock } from 'jest-mock-extended';
import { mockCharacterSheet } from './charactersheet';
import { mockGame } from './game';
import { mockAbilityLoader } from './abilityloader';
import { mockInfoProvideContext as _mockInfoProvideContext } from './information';
import { mockNightSheet } from './nightsheet';
import type { Player } from '~/game/player';
import type { Players } from '~/game/players';
import type { SaintPlayer, Task } from '~/game/types';
import type { Execution } from '~/game/execution';
import type { Game } from '~/game/game';
import type { NightSheet } from '~/game/nightsheet';
import type { CharacterSheet } from '~/game/charactersheet';
import type {
    AbilityUseContext,
    AbilitySetupContext,
    GetInfoAbilityUseContext,
} from '~/game/ability/ability';
import type { MayorAbilitySetupContext } from '~/game/ability/mayor';
import type { SaintAbilitySetupContext } from '~/game/ability/saint';
import type { VirginAbilityUseContext } from '~/game/ability/virgin';
import type { AbilityLoader } from '~/game/ability/abilityloader';
import type { InfoProvideContext } from '~/game/info/provider/provider';

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
    nightSheet?: NightSheet,
    characterSheet?: CharacterSheet,
    abilityLoader?: AbilityLoader
): AbilitySetupContext {
    if (context === undefined) {
        context = mockAbilityUseContext(player, players);
    }

    (context as AbilitySetupContext).nightSheet =
        nightSheet ?? mockNightSheet();

    (context as AbilitySetupContext).characterSheet =
        characterSheet ?? mockCharacterSheet();

    (context as AbilitySetupContext).abilityLoader =
        abilityLoader ?? mockAbilityLoader();

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
    return Object.assign(
        {},
        mockAbilitySetupContext(
            player,
            players,
            undefined,
            nightSheet,
            characterSheet
        ),
        {
            game: game ?? mockGame(),
        }
    );
}

export function mockSaintAbilitySetupContext(
    player?: SaintPlayer,
    players?: Players,
    game?: Game,
    nightSheet?: NightSheet,
    characterSheet?: CharacterSheet
): SaintAbilitySetupContext {
    return Object.assign(
        {},
        mockAbilitySetupContext(
            player,
            players,
            undefined,
            nightSheet,
            characterSheet
        ),
        {
            game: game ?? mockGame(),
        }
    );
}

export function mockSaintAbilityUseContext(
    player?: SaintPlayer,
    execution?: Execution
): VirginAbilityUseContext {
    return Object.assign({}, mockAbilityUseContext(player), {
        execution: execution ?? mock<Execution>(),
    });
}
