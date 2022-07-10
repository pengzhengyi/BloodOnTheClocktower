import script from './custom-script.json';
import { ScriptTool } from '~/game/scripttool';
import { Generator } from '~/game/collections';

describe('Load Custom Script', () => {
    const characterSheet = ScriptTool.load(script);

    test.concurrent('Every character type has at least one character', () => {
        const charactersForEachCharacterType = Generator.once(
            Generator.groupBy(
                characterSheet.characters,
                (character) => character.characterType
            )
        ).map(([_, characters]) => characters);

        for (const characters of charactersForEachCharacterType) {
            expect(characters.length).toBeGreaterThan(0);
        }
    });
});
