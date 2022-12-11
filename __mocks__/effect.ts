import { mock } from 'jest-mock-extended';
import { Effect } from '~/game/effect';

export function mockEffect() {
    return mock<Effect>();
}
