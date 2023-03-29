import {
    hasRaisedHandForVoteMock,
    storytellerConfirmMock,
} from '~/__mocks__/game-ui';
import { Execution } from '~/game/voting/execution';
import type { INomination } from '~/game/nomination';
import { Nomination } from '~/game/nomination';
import {
    createBasicPlayers,
    mockPlayer,
    setPlayerDead,
} from '~/__mocks__/player';
import type { IPlayer } from '~/game/player';
import { Generator } from '~/game/collections';
import { AttemptMoreThanOneExecution } from '~/game/exception/attempt-more-than-one-execution';

beforeAll(() => {
    storytellerConfirmMock.mockImplementation(() => Promise.resolve(true));
});

afterAll(() => {
    storytellerConfirmMock.mockReset();
});

export async function collectVotesForNomination(
    nomination: INomination,
    playerToWillRaiseHand: Map<IPlayer, boolean>
): Promise<Array<IPlayer>> {
    const votedPlayers: Array<IPlayer> = [];

    hasRaisedHandForVoteMock.mockImplementation(async (player: IPlayer) => {
        return (await playerToWillRaiseHand.get(player)) === true;
    });

    for await (const votedPlayer of nomination.collectVotes(
        playerToWillRaiseHand.keys()
    )) {
        votedPlayers.push(votedPlayer);
    }

    hasRaisedHandForVoteMock.mockReset();

    return votedPlayers;
}

async function* addNominations(
    execution: Execution,
    nominationPlayers: Array<[IPlayer, IPlayer]>
): AsyncIterable<boolean> {
    for (const [nominator, nominated] of nominationPlayers) {
        const nomination = new Nomination(nominator, nominated);
        yield await execution.addNomination(nomination);
    }
}

async function createExecutionAndAddNominations(
    nominationPlayers: Array<[IPlayer, IPlayer]>
): Promise<[Execution, Array<boolean>]> {
    const execution = Execution.init();

    const canAddNominations: Array<boolean> = [];

    for await (const canAddNomination of addNominations(
        execution,
        nominationPlayers
    )) {
        canAddNominations.push(canAddNomination);
    }

    return [execution, canAddNominations];
}

export async function createExecutionAndAddVotedNominations(
    nominationPlayers: Array<[IPlayer, IPlayer]>,
    playerToWillRaiseHandForEachNomination: Array<Map<IPlayer, boolean>>
): Promise<Execution> {
    const [execution, canAddNominations] =
        await createExecutionAndAddNominations(nominationPlayers);
    canAddNominations.forEach((canAddNomination) =>
        expect(canAddNomination).toBeTrue()
    );

    for (const [nomination, playerToWillRaiseHand] of Generator.pair(
        execution.nominations,
        playerToWillRaiseHandForEachNomination
    )) {
        await collectVotesForNomination(nomination, playerToWillRaiseHand);
    }

    return execution;
}

describe('Test basic functionalities', () => {
    test('Correctly get the player to execute', async () => {
        /**
         * Voted = V; Nominator = *; Nominated = @; Dead = #
         *             #     # #
         *   0 1 2 3 4 5 6 7 8 9 | player Index
         * 0 @ V*V V V
         * 1 V*@         V V V
         * 2   V V*V V V   @   V
         * 3 V   @       V V*
         * -
         * Nomination Index
         */
        const players = await createBasicPlayers(10);

        setPlayerDead(players[5]);
        setPlayerDead(players[8]);
        setPlayerDead(players[9]);

        const execution = await createExecutionAndAddVotedNominations(
            // [nominator, nominated]
            [
                [players[1], players[0]],
                [players[0], players[1]],
                [players[2], players[7]],
                [players[7], players[2]],
            ],
            [
                new Map([
                    [players[1], true],
                    [players[2], true],
                    [players[3], true],
                    [players[4], true],
                ]),
                new Map([
                    [players[0], true],
                    [players[6], true],
                    [players[7], true],
                    [players[8], true],
                ]),
                new Map([
                    [players[1], true],
                    [players[2], true],
                    [players[3], true],
                    [players[4], true],
                    [players[5], true],
                    [players[9], true],
                ]),
                new Map([
                    [players[0], true],
                    [players[6], true],
                    [players[7], true],
                ]),
            ]
        );

        await execution.setPlayerAboutToDieForExecution(10 - 3);
        expect(execution.toExecute).toEqual(players[7]);
        expect(await execution.execute()).toBeDefined();
        expect(await players[7].dead).toBeDefined();
    });
});

describe('Test Execution Edge Cases', () => {
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

    test('There is a maximum of one execution per day', async () => {
        const players = await createBasicPlayers(10);

        const execution = await createExecutionAndAddVotedNominations(
            [[players[0], players[1]]],
            [new Map(players.map((player) => [player, true]))]
        );

        expect(
            await execution.setPlayerAboutToDieForExecution(players.length)
        ).toBe(players[1]);
        expect(await execution.execute()).toBeDefined();
        expect(execution.executed).toBe(players[1]);

        await expect(() => execution.execute()).rejects.toThrowError(
            AttemptMoreThanOneExecution
        );
    });
});
