import { Imp } from '~/content/characters/output/imp';
import { Virgin } from '~/content/characters/output/virgin';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';

describe('Trouble Brewing', () => {
    test.concurrent('has imp', () => {
        expect(TroubleBrewing.characterSheet.characters).toContain(Imp);
        expect(TroubleBrewing.characterSheet.characters).toContain(Virgin);
    });
});
