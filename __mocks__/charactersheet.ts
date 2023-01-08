import { mock } from 'jest-mock-extended';
import type { CharacterSheet } from '~/game/charactersheet';

export function mockCharacterSheet(): CharacterSheet {
    return mock<CharacterSheet>();
}
