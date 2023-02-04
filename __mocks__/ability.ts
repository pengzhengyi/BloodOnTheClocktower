import { mock } from 'jest-mock-extended';
import { mockCharacterSheet } from './character-sheet';
import { mockGame } from './game';
import { mockAbilityLoader } from './ability-loader';
import { mockInfoProvideContext as _mockInfoProvideContext } from './information';
import { mockNightSheet } from './night-sheet';
import { mockClocktower } from './clocktower';
import type { IPlayer } from '~/game/player';
import type { IPlayers } from '~/game/players';
import type { PoisonerPlayer, SaintPlayer, Task } from '~/game/types';
import type { Execution } from '~/game/execution';
import type { Game } from '~/game/game';
import type { NightSheet } from '~/game/night-sheet';
import type { CharacterSheet } from '~/game/character-sheet';
import type {
    AbilityUseContext,
    AbilitySetupContext,
    GetInfoAbilityUseContext,
} from '~/game/ability/ability';
import type { MayorAbilitySetupContext } from '~/game/ability/mayor';
import type {
    SaintAbilitySetupContext,
    SaintAbilityUseContext,
} from '~/game/ability/saint';
import type { VirginAbilityUseContext } from '~/game/ability/virgin';
import type { IAbilityLoader } from '~/game/ability/loader';
import type { InfoProvideContext } from '~/game/info/provider/provider';
import type { IClocktower } from '~/game/clocktower';

export function mockAbilityUseContext(
    player?: IPlayer,
    players?: IPlayers
): AbilityUseContext {
    return {
        requestedPlayer: player ?? mock<IPlayer>(),
        players: players ?? mock<IPlayers>(),
    };
}

export function mockAbilitySetupContext(
    player?: IPlayer,
    players?: IPlayers,
    context?: AbilityUseContext,
    nightSheet?: NightSheet,
    characterSheet?: CharacterSheet,
    abilityLoader?: IAbilityLoader,
    clocktower?: IClocktower
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

    (context as AbilitySetupContext).clocktower =
        clocktower ?? mockClocktower();

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
    player?: IPlayer,
    execution?: Execution
): VirginAbilityUseContext {
    return Object.assign({}, mockAbilityUseContext(player), {
        execution: execution ?? mock<Execution>(),
    });
}

export function mockMayorAbilitySetupContext(
    player?: IPlayer,
    players?: IPlayers,
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
    players?: IPlayers,
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
): SaintAbilityUseContext {
    return Object.assign({}, mockAbilityUseContext(player), {
        execution: execution ?? mock<Execution>(),
    });
}

export function mockPoisonerAbilitySetupContext(
    poisonerPlayer: PoisonerPlayer,
    nightSheet?: NightSheet,
    clocktower?: IClocktower
) {
    return mockAbilitySetupContext(
        poisonerPlayer,
        undefined,
        undefined,
        nightSheet,
        undefined,
        undefined,
        clocktower
    );
}
