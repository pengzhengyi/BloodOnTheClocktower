import { storytellerConfirmMock } from '~/__mocks__/game-ui';
import { clockwise, randomChoice } from '~/game/common';
import type { IPlayer } from '~/game/player';
import { Seating } from '~/game/seating/seating';
import { createBasicPlayers } from '~/__mocks__/player';

async function createSeating(players: Array<IPlayer>): Promise<Seating> {
    const seating = await Seating.from(players);
    expect(seating.allSat).toBeTrue();
    return seating;
}

async function createPlayersAndSeating(
    numPlayers: number
): Promise<[Array<IPlayer>, Seating]> {
    const players = await createBasicPlayers(numPlayers);

    const seating = await createSeating(players);

    return [players, seating];
}

beforeAll(() => {
    storytellerConfirmMock.mockImplementation(() => Promise.resolve(true));
});

afterAll(() => {
    storytellerConfirmMock.mockReset();
});

describe('Test basic functionalities', () => {
    test('Get vote order', async () => {
        const [players, seating] = await createPlayersAndSeating(10);

        const nominatedSeatPosition = randomChoice(seating.seats).position;

        const expectedPlayersToVote = clockwise(
            players,
            nominatedSeatPosition + 1
        );

        for await (const actualPlayerToVote of seating.getVoteOrder(
            nominatedSeatPosition
        )) {
            const { done, value: expectedPlayerToVote } =
                expectedPlayersToVote.next();
            expect(done).toBeFalse();
            expect(actualPlayerToVote).toEqual(expectedPlayerToVote);
        }
    });

    test('exchange player seats', async () => {
        const [_players, seating] = await createPlayersAndSeating(8);

        const firstPlayer = seating.getPlayerOnSeat(4);
        const otherPlayer = seating.getPlayerOnSeat(6);

        const sitResults = await seating.exchange(4, 6);

        expect(sitResults).toHaveLength(2);
        expect(
            sitResults.map((sitResult) => sitResult.player)
        ).toIncludeSameMembers([firstPlayer, otherPlayer]);
        expect(
            sitResults.map((sitResult) => sitResult.hasSat)
        ).toIncludeAllMembers([true]);
    });
});
