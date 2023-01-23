import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue } from './common';
import { Effect } from '~/game/effect/effect';

export function mockApplicableEffect<TTarget extends object>() {
    const effect = mock<Effect<TTarget>>();
    effect.isApplicable.mockReturnValue(true);
    return effect;
}
export function mockInapplicableEffect<
    TTarget extends object
>(): Effect<TTarget> {
    const effect: Effect<TTarget> = mockWithPropertyValue('active', false);

    (effect.isApplicable as any).mockReturnValue(false);

    return effect;
}
