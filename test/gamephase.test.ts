import { storytellerConfirmMock } from '~/__mocks__/gameui';
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

describe('test basic GamePhase functionality', () => {
    test.concurrent('initial game phase toString', () => {
        const gamePhase = GamePhase.firstNight();
        expect(gamePhase.toString()).toEqual('Night 0');
    });

    test.concurrent('test equality', () => {
        const firstNightGamePhase1 = GamePhase.firstNight();
        const firstNightGamePhase2 = GamePhase.of(1);
        expect(firstNightGamePhase1).toEqual(firstNightGamePhase2);
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
