import { mock } from 'jest-mock-extended';
import { mockInfoProvideContext as _mockInfoProvideContext } from './information';
import type {
    AbilityUseContext,
    GetInfoAbilityUseContext,
} from '~/game/ability';
import { Player } from '~/game/player';
import type { InfoProvideContext } from '~/game/infoprovider';

export function mockAbilityUseContext(): AbilityUseContext {
    return {
        requestedPlayer: mock<Player>(),
    };
}

export function mockGetInfoAbilityUseContext(
    mockInfoProvideContext: () => InfoProvideContext = _mockInfoProvideContext
): GetInfoAbilityUseContext {
    return {
        ...mockAbilityUseContext(),
        ...mockInfoProvideContext(),
    };
}
