import {
    EffectPrecedence,
    getPriorityMock,
} from '~/__mocks__/effectprecedence';

jest.mock('~/game/effectprecedence', () => ({
    EffectPrecedence,
}));

import { Effect } from '~/game/effect';
import { Effects } from '~/game/effects';
import { mockEffect } from '~/__mocks__/effect';

function createEffects(effectToPriority: Map<Effect, number>): Effects {
    const effects = new Effects();

    getPriorityMock.mockImplementation(
        (effect: Effect) => effectToPriority.get(effect) || 0
    );

    for (const effect of effectToPriority.keys()) {
        effects.add(effect);
    }

    getPriorityMock.mockClear();
    getPriorityMock.mockReset();

    return effects;
}

describe('Test Effects basic functionalities', () => {
    test('iteration order', () => {
        const effect1 = mockEffect();
        const effect2 = mockEffect();
        const effect3 = mockEffect();
        const effect4 = mockEffect();
        const effect5 = mockEffect();
        const effect6 = mockEffect();

        const effectToPriority = new Map<Effect, number>([
            [effect1, 1],
            [effect2, 1],
            [effect3, 3],
            [effect4, 2],
            [effect5, 2],
            [effect6, 1],
        ]);

        const effects = createEffects(effectToPriority);
        expect(effects.size).toEqual(6);
        expect(effects.has(effect2)).toBeTrue();

        const effectByPriority = Array.from(effects);

        expect(effectByPriority).toEqual([
            effect3,
            effect5,
            effect4,
            effect6,
            effect2,
            effect1,
        ]);
    });
});
