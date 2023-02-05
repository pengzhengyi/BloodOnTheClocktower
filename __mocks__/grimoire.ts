import { mock } from 'jest-mock-extended';
import type { IGrimoire } from '~/game/grimoire';

export function mockGrimoire(): IGrimoire {
    return mock<IGrimoire>();
}
