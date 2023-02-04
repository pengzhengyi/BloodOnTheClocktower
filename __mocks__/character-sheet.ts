import { mock } from 'jest-mock-extended';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import type { CharacterSheet } from '~/game/character/character-sheet';

export function mockCharacterSheet(): CharacterSheet {
    return mock<CharacterSheet>();
}

export function getTroubleBrewingCharacterSheet(): CharacterSheet {
    return TroubleBrewing.characterSheet;
}
