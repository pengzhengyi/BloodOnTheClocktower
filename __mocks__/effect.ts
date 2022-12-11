import { mock } from 'jest-mock-extended';
import { mockWithPropertyValue } from './common';
import { Effect } from '~/game/effect';

export function mockEffect() {
    return mock<Effect>();
}
export function mockInactiveEffect(): Effect {
    return mockWithPropertyValue('active', false);
}
