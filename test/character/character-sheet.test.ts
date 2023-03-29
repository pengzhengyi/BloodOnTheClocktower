import { CharacterSheetFactory } from '~/game/character/character-sheet-factory';
import { Demon, Townsfolk } from '~/game/character/character-type';
import { Imp, Chef } from '~/__mocks__/character';

describe('test CharacterSheet serialization', () => {
    const characterSheet =
        CharacterSheetFactory.getInstance().getFromCharacterIds([
            Imp.id,
            Chef.id,
        ]);

    test.concurrent('convert to object', () => {
        const characterSheetObj = characterSheet.toJSON();

        expect(characterSheetObj[Demon.id]).toContain(Imp.id);
        expect(characterSheetObj[Townsfolk.id]).toContain(Chef.id);
    });
});
