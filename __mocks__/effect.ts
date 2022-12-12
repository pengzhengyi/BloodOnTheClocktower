import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue } from './common';
import { Effect } from '~/game/effect';

export function mockEffect<TTarget extends object>() {
    return mock<Effect<TTarget>>();
}
export function mockInactiveEffect<TTarget extends object>(): Effect<TTarget> {
    return mockWithPropertyValue('active', false);
}
