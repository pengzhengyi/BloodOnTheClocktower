import { GAME_UI, storytellerConfirmMock } from '~/__mocks__/gameui';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import { GamePhase, Phase } from '~/game/gamephase';

async function createGamePhase(phaseIndex: number): Promise<GamePhase> {
    const gamePhase = GamePhase.setup();

    storytellerConfirmMock.mockImplementation(async () => await true);

    for (let i = 0; i < phaseIndex; i++) {
        await gamePhase.forceTransition();
    }

    expect(storytellerConfirmMock).toHaveBeenCalled();
    storytellerConfirmMock.mockReset();

    return gamePhase;
}

describe('test GamePhase toString', () => {
    test.concurrent('initial game phase toString', () => {
        const gamePhase = new GamePhase();
        expect(gamePhase.toString()).toEqual('Night 0');
    });
});

describe('test GamePhase data indexing', () => {
    test('check for phase 4', async () => {
        const gamePhase = await createGamePhase(4);
        expect(gamePhase.phase).toEqual(Phase.Dusk);
        expect(gamePhase.dateIndex).toEqual(1);
    });

    test('check for phase 7', async () => {
        const gamePhase = await createGamePhase(7);
        expect(gamePhase.isDay).toBeTrue();
        expect(gamePhase.phase).toEqual(Phase.Day);
        expect(gamePhase.dateIndex).toEqual(2);
    });
});
