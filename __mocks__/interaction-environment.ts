import { mockDeep } from 'jest-mock-extended';
import type { IInteractionEnvironment } from '~/interaction/environment/types';

export function mockInteractionEnvironment(): IInteractionEnvironment {
    return mockDeep<IInteractionEnvironment>();
}
