import { GAME_UI, storytellerConfirmMock } from '~/__mocks__/gameui';
jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import { SeatAssignmentMode } from '~/game/seating';
import { TownSquare } from '~/game/townsquare';
import { createBasicPlayers } from '~/__mocks__/player';

beforeAll(() => {
    storytellerConfirmMock.mockImplementation(async () => await true);
});

afterAll(() => {
    storytellerConfirmMock.mockClear();
});

describe('Test basic functionalities', () => {
    afterEach(() => {
        storytellerConfirmMock.mockClear();
    });

    test('create equal number of players and seats and then random assign', async () => {
        const numPlayers = 12;
        const players = await createBasicPlayers(numPlayers);
        const townsquare = await TownSquare.from(
            players,
            SeatAssignmentMode.RandomInsert
        );

        const seatAssignment = townsquare.seatAssignment;
        expect(seatAssignment.unoccupied.size).toEqual(0);
        expect(seatAssignment.unassigned.size).toEqual(0);
        expect(seatAssignment.occupied.size).toEqual(numPlayers);
        expect(seatAssignment.assigned.size).toEqual(numPlayers);
    });
});
