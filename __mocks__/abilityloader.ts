import { mock } from 'jest-mock-extended';
import type { AbilityLoader } from '~/game/ability/abilityloader';

export function mockAbilityLoader() {
    return mock<AbilityLoader>();
}
