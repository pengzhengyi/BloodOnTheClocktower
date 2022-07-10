import { ID_TO_CHARACTER } from '~/content/characters/output/characters';
import { Fanggu } from '~/content/characters/output/fanggu';
import { Demon, Minion, Outsider, Townsfolk } from '~/game/charactertype';
import { Generator } from '~/game/collections';

describe('test Generator', () => {
    const elements = ['Alice', 'Bob', 'Peter'];

    test.concurrent('isNot', () => {
        expect(
            new Generator(elements).isNot('Alice').isNot('Peter').take(1)
        ).toEqual('Bob');
    });

    test.concurrent('filter by string length', () => {
        expect(
            new Generator(elements)
                .filter((element) => element.length > 3)
                .take()
        ).toEqual(['Alice', 'Peter']);
    });

    test.concurrent('map to different type', () => {
        expect(
            new Generator(elements)
                .map((element) => [element.length, element])
                .filter((element) => element[0] > 3)
                .take(1)
        ).toEqual([5, 'Alice']);
    });

    test.concurrent('multiple iterations', () => {
        const iterable = new Generator(elements).isNot('Peter');
        expect(Array.from(iterable)).toEqual(['Alice', 'Bob']);
        expect(Array.from(iterable)).toEqual(['Alice', 'Bob']);

        // transform again
        expect(iterable.isNot('Alice').take()).toEqual(['Bob']);
    });

    test.concurrent('simple combinations', () => {
        expect(Array.from(Generator.combinations(1, elements))).toEqual([
            ['Alice'],
            ['Bob'],
            ['Peter'],
        ]);

        expect(Array.from(Generator.combinations(3, elements))).toEqual([
            ['Alice', 'Bob', 'Peter'],
        ]);

        expect(Array.from(Generator.combinations(2, elements)).sort()).toEqual(
            [
                ['Alice', 'Bob'],
                ['Alice', 'Peter'],
                ['Bob', 'Peter'],
            ].sort()
        );
    });

    test.concurrent('more combinations', () => {
        expect(
            Array.from(new Generator('abcd').combinations(2)).sort()
        ).toEqual(
            [
                ['a', 'b'],
                ['a', 'c'],
                ['a', 'd'],
                ['b', 'c'],
                ['b', 'd'],
                ['c', 'd'],
            ].sort()
        );
    });

    test.concurrent('prioritize with characters', () => {
        const generator = new Generator(ID_TO_CHARACTER.values());
        const characters = Array.from(
            generator.prioritize(
                [
                    {
                        key: Townsfolk,
                        desiredNumber: 6,
                        isStrictUpperbound: true,
                    },
                    {
                        key: Outsider,
                        desiredNumber: 2,
                        isStrictUpperbound: true,
                    },
                    { key: Minion, desiredNumber: 2, isStrictUpperbound: true },
                    { key: Demon, desiredNumber: 1, isStrictUpperbound: true },
                ],
                (character) => character.characterType
            )
        );

        expect(characters.length).toBe(6 + 2 + 2 + 1);

        const characterTypeToCharacters = Generator.groupBy(
            characters,
            (character) => character.characterType
        );

        expect(characterTypeToCharacters.get(Townsfolk)?.length).toBe(6);
        expect(characterTypeToCharacters.get(Outsider)?.length).toBe(2);
        expect(characterTypeToCharacters.get(Minion)?.length).toBe(2);
        expect(characterTypeToCharacters.get(Demon)?.length).toBe(1);
    });

    test.concurrent('Get Demons', () => {
        const generator = new Generator(ID_TO_CHARACTER.values());
        const characters = Array.from(
            generator.prioritize(
                [{ key: Demon }],
                (character) => character.characterType
            )
        );
        expect(characters.length).toBeGreaterThan(0);
        expect(characters).toContain(Fanggu);
    });
});
