import { mock } from 'jest-mock-extended';
import { mockInfoProvideContext as _mockInfoProvideContext } from './information';
import type {
    AbilityUseContext,
    GetInfoAbilityUseContext,
    VirginAbilityUseContext,
} from '~/game/ability';
import type { Player } from '~/game/player';
import type { Players } from '~/game/players';
import type { Task } from '~/game/types';
import type { InfoProvideContext } from '~/game/infoprovider';
import type { Execution } from '~/game/execution';

export function mockAbilityUseContext(
    player?: Player,
    players?: Players
): AbilityUseContext {
    return {
        requestedPlayer: player ?? mock<Player>(),
        players: players ?? mock<Players>(),
    };
}

export const mockAbilitySetupContext = mockAbilityUseContext;

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
