import script from './custom-script.json';
import { ScriptConstraintsHelper, ScriptTool } from '~/game/scripttool';
import { Generator } from '~/game/collections';
import { EditionName } from '~/game/edition';
import { EditionKeyName } from '~/game/types';
import { Scarletwoman } from '~/content/characters/output/scarletwoman';
import { Virgin } from '~/content/characters/output/virgin';
import { Judge } from '~/content/characters/output/judge';
import { Mathematician } from '~/content/characters/output/mathematician';

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

    test.concurrent(
        'create a custom edition based on custom character sheet',
        () => {
            const customEdition = ScriptTool.createCustomEdition(
                characterSheet,
                {
                    [EditionKeyName.NAME]: 'custom1',
                }
            );

            expect(customEdition.townsfolk.includes(Mathematician)).toBeTrue();
            expect(customEdition.characters).toHaveLength(script.length);
        }
    );
});

describe('Random CharacterSheet Generation', () => {
    test.concurrent('Default Generation: Ravenswood Bluff', async () => {
        const constraints = ScriptConstraintsHelper.defaultConstraints();
        const characterSheets = await ScriptTool.candidates(constraints, 5);

        let lastCharacterSheet;
        for (const characterSheet of characterSheets) {
            expect(characterSheet.townsfolk).toHaveLength(
                constraints.townsfolk
            );
            expect(characterSheet.outsider).toHaveLength(constraints.outsider);
            expect(characterSheet.minion).toHaveLength(constraints.minion);
            expect(characterSheet.demon).toHaveLength(constraints.demon);
            expect(characterSheet.traveller).toHaveLength(
                constraints.traveller
            );

            if (lastCharacterSheet !== undefined) {
                expect(characterSheet.characters).not.toEqual(
                    lastCharacterSheet.characters
                );
            }

            lastCharacterSheet = characterSheet;
        }
    });

    test.concurrent(
        'Teensyville with must included characters and must excluded characters and a traveller',
        async () => {
            const constraints = {
                editions: [EditionName.TroubleBrewing],
                townsfolk: 6,
                outsider: 2,
                minion: 2,
                demon: 1,
                traveller: 1,
                includes: [Scarletwoman.id, Judge.id],
                excludes: [Virgin.id],
            };
            const characterSheets = await ScriptTool.candidates(constraints, 3);

            let lastCharacterSheet;
            for (const characterSheet of characterSheets) {
                expect(characterSheet.townsfolk).toHaveLength(
                    constraints.townsfolk
                );
                expect(characterSheet.outsider).toHaveLength(
                    constraints.outsider
                );
                expect(characterSheet.minion).toHaveLength(constraints.minion);
                expect(characterSheet.demon).toHaveLength(constraints.demon);
                expect(characterSheet.traveller).toHaveLength(
                    constraints.traveller
                );

                expect(characterSheet.townsfolk).not.toContain(Virgin);
                expect(characterSheet.minion).toContain(Scarletwoman);
                expect(characterSheet.traveller).toContain(Judge);

                if (lastCharacterSheet !== undefined) {
                    expect(characterSheet.characters).not.toEqual(
                        lastCharacterSheet.characters
                    );
                }

                lastCharacterSheet = characterSheet;
            }
        }
    );
});
