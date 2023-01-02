import { mock } from 'jest-mock-extended';
import type { Execution } from '~/game/execution';

export function mockExecution() {
    return mock<Execution>();
}
