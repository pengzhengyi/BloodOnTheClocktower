import {
    binarySearch,
    clockwise,
    counterclockwise,
    shuffle,
} from '~/game/common';

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

describe('test shuffle', () => {
    test.concurrent('random shuffle an array', () => {
        const elements = [1, 2, 3, 4, 5];
        const shuffled = shuffle(elements);

        expect(elements).toIncludeAllMembers(shuffled);
    });
});

describe('test binary search', () => {
    const elements = [1, 3, 6, 9];

    test.concurrent('find index of last element less than 2', () => {
        expect(binarySearch(elements, (n) => n < 2)).toEqual(0);
    });

    test.concurrent('find index of last element less than 0', () => {
        expect(binarySearch(elements, (n) => n < 0)).toEqual(-1);
    });

    test.concurrent('find index of last element less than 100', () => {
        expect(binarySearch(elements, (n) => n < 100)).toEqual(3);
    });

    test.concurrent(
        'find index of last element less than or equal with 6',
        () => {
            expect(binarySearch(elements, (n) => n <= 6)).toEqual(2);
        }
    );
});
