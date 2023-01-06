import { mockDeep } from 'jest-mock-extended';
import type { Game } from '~/game/game';

export function mockGame(): Game {
    return mockDeep<Game>();
}
