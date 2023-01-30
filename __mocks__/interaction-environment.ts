import { mockDeep } from 'jest-mock-extended';
import type { IInteractionEnvironment } from '~/interaction/environment';

export function mockInteractionEnvironment(): IInteractionEnvironment {
    return mockDeep<IInteractionEnvironment>();
}
