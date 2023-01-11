import { mock } from 'jest-mock-extended';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import type { CharacterSheet } from '~/game/charactersheet';

export function mockCharacterSheet(): CharacterSheet {
    return mock<CharacterSheet>();
}

export function getTroubleBrewingCharacterSheet(): CharacterSheet {
    return TroubleBrewing.characterSheet;
}
