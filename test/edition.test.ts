import { Imp } from '~/content/characters/output/imp';
import { Virgin } from '~/content/characters/output/virgin';
import { getTroubleBrewingCharacterSheet } from '~/__mocks__/character-sheet';

describe('Trouble Brewing', () => {
    const troubleBrewingCharacterSheet = getTroubleBrewingCharacterSheet();

    test.concurrent('has imp', () => {
        expect(troubleBrewingCharacterSheet.characters).toContain(Imp);
        expect(troubleBrewingCharacterSheet.characters).toContain(Virgin);
    });
});
