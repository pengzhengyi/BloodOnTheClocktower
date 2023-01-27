import { mockDeep } from 'jest-mock-extended';
import type { IClocktower } from '~/game/clocktower';

export function mockClocktower(): IClocktower {
    return mockDeep<IClocktower>();
}
