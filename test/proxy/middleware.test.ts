import { Pipeline } from '~/game/proxy/pipeline';
import { Operation } from '~/__mocks__/middleware';

describe('Test basic functionalities', () => {
    test.concurrent('Test middleware execution order', () => {
        const multiplyBy2 = new Operation<number>((x) => x * 2, true);
        const minus6 = new Operation<number>((x) => x - 6, false);
        const plus1 = new Operation<number>((x) => x + 1, false);

        const pipeline = new Pipeline<number>([plus1, minus6, multiplyBy2]);
        expect(pipeline.apply(4)).toEqual(4 * 2 - 6 + 1);
    });

    test.concurrent('Test middleware execution order', () => {
        const divideBy2 = new Operation<number>((x) => x / 2, true);
        const minus4 = new Operation<number>((x) => x - 4, false);
        const plus2 = new Operation<number>((x) => x + 2, false);

        const pipeline = new Pipeline<number>([minus4, divideBy2, plus2]);
        expect(pipeline.apply(8)).toEqual(8 / 2 + 2 - 4);
    });
});
