import { GamePhase } from '~/game/gamephase';

describe('test GamePhase toString', () => {
    test.concurrent('initial game phase toString', () => {
        const gamePhase = new GamePhase();
        expect(gamePhase.toString()).toEqual('Night 0');
    });
});
