import { Chef } from '~/content/characters/output/chef';
import { Imp } from '~/content/characters/output/imp';
import { CharacterSheet } from '~/game/character/character-sheet';
import { Demon, Townsfolk } from '~/game/character/character-type';

describe('test CharacterSheet serialization', () => {
    const characterSheet = CharacterSheet.from([Imp.id, Chef.id]);

    test.concurrent('convert to object', () => {
        const characterSheetObj = characterSheet.toJSON();

        expect(characterSheetObj[Demon.id]).toContain(Imp.id);
        expect(characterSheetObj[Townsfolk.id]).toContain(Chef.id);
    });
});
