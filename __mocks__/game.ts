import { mockDeep } from 'jest-mock-extended';
import { Game } from '~/game/game';

export function mockGame(): Game {
    return mockDeep<Game>();
}

export function createBasicGame(): Game {
    return Game.init();
}
