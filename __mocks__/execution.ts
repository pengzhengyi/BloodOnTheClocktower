import { mock } from 'jest-mock-extended';
import type { IExecution } from '~/game/voting/execution';

export function mockExecution() {
    return mock<IExecution>();
}
