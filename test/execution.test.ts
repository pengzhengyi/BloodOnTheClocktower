import {
    hasRaisedHandForVoteMock,
    storytellerConfirmMock,
} from '~/__mocks__/gameui';
import { Execution } from '~/game/execution';
import { Nomination } from '~/game/nomination';
import {
    createBasicPlayers,
    mockPlayer,
    setPlayerDead,
} from '~/__mocks__/player';
import { Player } from '~/game/player';
import { Generator } from '~/game/collections';
import { AttemptMoreThanOneExecution } from '~/game/exception';

beforeAll(() => {
    storytellerConfirmMock.mockImplementation(async () => await true);
});

afterAll(() => {
    storytellerConfirmMock.mockReset();
});

export async function collectVotesForNomination(
    nomination: Nomination,
    playerToWillRaiseHand: Map<Player, boolean>
): Promise<Array<Player>> {
    const votedPlayers: Array<Player> = [];

    hasRaisedHandForVoteMock.mockImplementation(async (player: Player) => {
        return (await playerToWillRaiseHand.get(player)) === true;
    });

    for await (const votedPlayer of nomination.startVote(
        playerToWillRaiseHand.keys()
    )) {
        votedPlayers.push(votedPlayer);
    }

    hasRaisedHandForVoteMock.mockReset();

    return votedPlayers;
}

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

async function createExecutionAndAddVotedNominations(
    nominationPlayers: Array<[Player, Player]>,
    playerToWillRaiseHandForEachNomination: Array<Map<Player, boolean>>
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
         *   0 1 2 3 4 5 6 7 8 9 | Player Index
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

        await execution.setPlayerAboutToDie(10 - 3);
        expect(execution.toExecute).toEqual(players[7]);
        expect(await execution.execute()).toBeTrue();
        expect(players[7].dead).toBeTrue();
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

        expect(await execution.setPlayerAboutToDie(players.length)).toBe(
            players[1]
        );
        expect(await execution.execute()).toBeTrue();
        expect(execution.executed).toBe(players[1]);

        await expect(
            async () => await execution.execute()
        ).rejects.toThrowError(AttemptMoreThanOneExecution);
    });
});