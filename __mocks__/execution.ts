import { mock } from 'jest-mock-extended';
import type { Execution } from '~/game/voting/execution';

export function mockExecution() {
    return mock<Execution>();
}
