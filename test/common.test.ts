import { clockwise, counterclockwise } from '~/game/common';

describe('test clockwise', () => {
    const elements = ['Alice', 'Bob', 'Peter'];

    test.concurrent('start index is -5', () => {
        expect(Array.from(clockwise(elements, -5))).toEqual(elements);
    });

    test.concurrent('start index is 0', () => {
        expect(Array.from(clockwise(elements, 0))).toEqual(elements);
    });

    test.concurrent('start index is 1', () => {
        expect(Array.from(clockwise(elements, 1))).toEqual([
            'Bob',
            'Peter',
            'Alice',
        ]);
    });

    test.concurrent('start index is 2', () => {
        expect(Array.from(clockwise(elements, 2))).toEqual([
            'Peter',
            'Alice',
            'Bob',
        ]);
    });

    test.concurrent('start index is 7', () => {
        expect(Array.from(clockwise(elements, 7))).toEqual(elements);
    });
});

describe('test counterclockwise', () => {
    const elements = ['Alice', 'Bob', 'Peter'];

    test.concurrent('start index is -10', () => {
        expect(Array.from(counterclockwise(elements, -10))).toEqual([
            'Peter',
            'Bob',
            'Alice',
        ]);
    });

    test.concurrent('start index is 0', () => {
        expect(Array.from(counterclockwise(elements, 0))).toEqual([
            'Alice',
            'Peter',
            'Bob',
        ]);
    });

    test.concurrent('start index is 1', () => {
        expect(Array.from(counterclockwise(elements, 1))).toEqual([
            'Bob',

            'Alice',
            'Peter',
        ]);
    });

    test.concurrent('start index is 2', () => {
        expect(Array.from(counterclockwise(elements, 2))).toEqual([
            'Peter',
            'Bob',
            'Alice',
        ]);
    });

    test.concurrent('start index is 5', () => {
        expect(Array.from(counterclockwise(elements, 3))).toEqual([
            'Peter',
            'Bob',
            'Alice',
        ]);
    });
});
