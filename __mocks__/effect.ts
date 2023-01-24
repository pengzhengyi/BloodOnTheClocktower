import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue } from './common';
import type { IEffect } from '~/game/effect/effect';

export function mockApplicableEffect<TTarget extends object>() {
    const effect = mock<IEffect<TTarget>>();
    effect.isApplicable.mockReturnValue(true);
    return effect;
}
export function mockInapplicableEffect<
    TTarget extends object
>(): IEffect<TTarget> {
    const effect: IEffect<TTarget> = mockWithPropertyValue('active', false);

    (effect.isApplicable as any).mockReturnValue(false);

    return effect;
}
