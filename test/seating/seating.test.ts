import { storytellerConfirmMock } from '~/__mocks__/game-ui';
import { clockwise, getRandomIntInclusive } from '~/game/common';
import type { IPlayer } from '~/game/player';
import { Seating, ISeating } from '~/game/seating/seating';
import { createBasicPlayers } from '~/__mocks__/player';
import { createSeatingAndAssignPlayers } from '~/__mocks__/seating';

async function createPlayersAndSeating(
    numPlayers: number
): Promise<[Array<IPlayer>, ISeating]> {
    const players = await createBasicPlayers(numPlayers);

    const seating = await createSeatingAndAssignPlayers(players);

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

        const nominatedSeatPosition = getRandomIntInclusive(
            0,
            seating.numSeats - 1
        );

        const expectedPlayersToVote = clockwise(
            players,
            nominatedSeatPosition + 1
        );

        for await (const actualPlayerToVote of Seating.getVoteOrder(
            seating,
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

        const firstPlayer = seating.getSeat(4).player;
        const otherPlayer = seating.getSeat(6).player;

        const sitResults = await Seating.exchange(seating, 4, 6);

        expect(sitResults).toHaveLength(2);
        expect(
            sitResults.map((sitResult) => sitResult.player)
        ).toIncludeSameMembers([firstPlayer, otherPlayer]);
        expect(
            sitResults.map((sitResult) => sitResult.hasSat)
        ).toIncludeAllMembers([true]);
    });
});
