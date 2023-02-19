import { mock } from 'jest-mock-extended';
import type { IAbilityLoader } from '~/game/ability/ability-loader';

export function mockAbilityLoader() {
    return mock<IAbilityLoader>();
}
