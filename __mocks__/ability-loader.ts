import { mock } from 'jest-mock-extended';
import type { AbilityLoader } from '~/game/ability/loader';

export function mockAbilityLoader() {
    return mock<AbilityLoader>();
}
