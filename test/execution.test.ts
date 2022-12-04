import { GAME_UI } from '~/__mocks__/gameui';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import { Execution } from '~/game/execution';
import { Nomination } from '~/game/nomination';

import { mockPlayer } from '~/__mocks__/player';
import { Player } from '~/game/player';

async function* addNominations(
    execution: Execution,
    nominationPlayers: Array<[Player, Player]>
): AsyncIterable<boolean> {
    for (const [nominator, nominated] of nominationPlayers) {
        const nomination = await Nomination.init(nominator, nominated);
        yield await execution.addNomination(nomination);
    }
}

async function createExecutionAndAddNominations(
    nominationPlayers: Array<[Player, Player]>
): Promise<[Execution, Array<boolean>]> {
    const execution = new Execution();

    const canAddNominations: Array<boolean> = [];

    for await (const canAddNomination of addNominations(
        execution,
        nominationPlayers
    )) {
        canAddNominations.push(canAddNomination);
    }

    return [execution, canAddNominations];
}

describe('Test Execution Edge Cases', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Players may nominate once per day', async () => {
        const nominator = mockPlayer();
        const nominated1 = mockPlayer();
        const nominated2 = mockPlayer();

        const [_, canAddNominations] = await createExecutionAndAddNominations([
            [nominator, nominated1],
            [nominator, nominated2],
        ]);

        expect(canAddNominations).toEqual([true, false]);
    });

    test('Players can be nominated once per day', async () => {
        const nominator1 = mockPlayer();
        const nominator2 = mockPlayer();
        const nominated = mockPlayer();

        const [_, canAddNominations] = await createExecutionAndAddNominations([
            [nominator1, nominated],
            [nominator2, nominated],
        ]);

        expect(canAddNominations).toEqual([true, false]);
    });
});
