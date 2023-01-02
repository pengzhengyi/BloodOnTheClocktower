import { mock } from 'jest-mock-extended';
import { mockInfoProvideContext as _mockInfoProvideContext } from './information';
import type {
    AbilityUseContext,
    GetInfoAbilityUseContext,
} from '~/game/ability';
import type { Player } from '~/game/player';
import type { Players } from '~/game/players';
import type { Task } from '~/game/types';
import type { InfoProvideContext } from '~/game/infoprovider';

export function mockAbilityUseContext(): AbilityUseContext {
    return {
        requestedPlayer: mock<Player>(),
        players: mock<Players>(),
    };
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
