import { mockDeep } from 'jest-mock-extended';
import { IGame, Game } from '~/game/game';

export function mockGame(): IGame {
    return mockDeep<IGame>();
}

export function createBasicGame(): IGame {
    return Game.init();
}
