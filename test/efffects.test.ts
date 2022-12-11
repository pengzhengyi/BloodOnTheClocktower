import {
    EffectPrecedence,
    getPriorityMock,
} from '~/__mocks__/effectprecedence';

jest.mock('~/game/effectprecedence', () => ({
    EffectPrecedence,
}));

import { Effect } from '~/game/effect';
import { Effects } from '~/game/effects';
import { mockEffect, mockInactiveEffect } from '~/__mocks__/effect';
import { createBasicPlayer, mockPlayer } from '~/__mocks__/player';

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

    test('active effects only', () => {
        const effect1 = mockEffect();
        const effect2 = mockEffect();
        const effect3 = mockEffect();
        const effect4 = mockInactiveEffect();
        const effect5 = mockInactiveEffect();
        const effect6 = mockInactiveEffect();

        const effectToPriority = new Map<Effect, number>([
            [effect1, 1],
            [effect2, 1],
            [effect3, 3],
            [effect4, 2],
            [effect5, 2],
            [effect6, 1],
        ]);

        const effects = createEffects(effectToPriority);

        const effectByPriority = Array.from(effects.getActiveEffects());

        expect(effectByPriority).toEqual([effect3, effect2, effect1]);
    });
});

describe('Test Effects edge cases', () => {
    test('apply with no effect', async () => {
        const effects = new Effects();
        const player = mockPlayer();
        const result = await effects.apply(player);
        expect(result).toBe(player);
    });

    test('apply when there is an effect with empty apply', async () => {
        const effect = mockEffect();
        const effectToPriority = new Map<Effect, number>([[effect, 1]]);

        const effects = createEffects(effectToPriority);
        const player = await createBasicPlayer();
        const effectByPriority = Array.from(effects.getActiveEffects());
        expect(effectByPriority).toEqual([effect]);
        const result = await effects.apply(player);
        expect(result).toBeUndefined();
    });
});
