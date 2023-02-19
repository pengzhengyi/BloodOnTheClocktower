import { mock } from 'jest-mock-extended';
import { TroubleBrewing } from './edition';
import type { ICharacterSheet } from '~/game/character/character-sheet';
import { CharacterSheetFactory } from '~/game/character/character-sheet-factory';

export function mockCharacterSheet(): ICharacterSheet {
    return mock<ICharacterSheet>();
}

export function getTroubleBrewingCharacterSheet(): ICharacterSheet {
    return CharacterSheetFactory.getInstance().getFromEdition(TroubleBrewing);
}
