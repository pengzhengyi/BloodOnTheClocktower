import { Generator } from '~/game/collections';

describe('test Generator', () => {
    const elements = ['Alice', 'Bob', 'Peter'];

    test('isNot', () => {
        expect(
            new Generator(elements).isNot('Alice').isNot('Peter').take(1)
        ).toEqual('Bob');
    });

    test('filter by string length', () => {
        expect(
            new Generator(elements)
                .filter((element) => element.length > 3)
                .take()
        ).toEqual(['Alice', 'Peter']);
    });

    test('map to different type', () => {
        expect(
            new Generator(elements)
                .map((element) => [element.length, element])
                .filter((element) => element[0] > 3)
                .take(1)
        ).toEqual([5, 'Alice']);
    });

    test('multiple iterations', () => {
        const iterable = new Generator(elements).isNot('Peter');
        expect(Array.from(iterable)).toEqual(['Alice', 'Bob']);
        expect(Array.from(iterable)).toEqual(['Alice', 'Bob']);

        // transform again
        expect(iterable.isNot('Alice').take()).toEqual(['Bob']);
    });

    test('simple combinations', () => {
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

    test('more combinations', () => {
        expect(new Generator('abcd').combinations(2).take()!.sort()).toEqual(
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
});
