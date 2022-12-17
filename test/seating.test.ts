import { GAME_UI, storytellerConfirmMock } from '~/__mocks__/gameui';
jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));
import { clockwise, randomChoice } from '~/game/common';
import { Player } from '~/game/player';
import { Seating } from '~/game/seating';
import { createBasicPlayers } from '~/__mocks__/player';

async function createSeating(players: Array<Player>): Promise<Seating> {
    const numPlayers = players.length;
    const seating = await Seating.init(numPlayers);

    for await (const hasSat of seating.sit(players)) {
        expect(hasSat).toBeTrue();
    }

    expect(seating.allSat).toBeTrue();

    return seating;
}

async function createPlayersAndSeating(
    numPlayers: number
): Promise<[Array<Player>, Seating]> {
    const players = await createBasicPlayers(numPlayers);

    const seating = await createSeating(players);

    return [players, seating];
}

beforeAll(() => {
    storytellerConfirmMock.mockImplementation(async () => await true);
});

afterAll(() => {
    storytellerConfirmMock.mockClear();
});

describe('Test basic functionalities', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

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
});