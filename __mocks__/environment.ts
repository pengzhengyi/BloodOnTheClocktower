import { mockDeep } from 'jest-mock-extended';
import type { IEnvironment } from '~/interaction/environment';

export function mockEnvironment(): IEnvironment {
    return mockDeep<IEnvironment>();
}
