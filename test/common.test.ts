import { clockwise } from '~/common/common';

describe('test clockwise', () => {
    const elements = ['Alice', 'Bob', 'Peter'];

    test('start index is -1', () => {
        expect(Array.from(clockwise(elements, -1))).toEqual(elements);
    });

    test('start index is 0', () => {
        expect(Array.from(clockwise(elements, 0))).toEqual(elements);
    });

    test('start index is 1', () => {
        expect(Array.from(clockwise(elements, 1))).toEqual([
            'Bob',
            'Peter',
            'Alice',
        ]);
    });

    test('start index is 2', () => {
        expect(Array.from(clockwise(elements, 2))).toEqual([
            'Peter',
            'Alice',
            'Bob',
        ]);
    });

    test('start index is 3', () => {
        expect(Array.from(clockwise(elements, 3))).toEqual(elements);
    });
});
