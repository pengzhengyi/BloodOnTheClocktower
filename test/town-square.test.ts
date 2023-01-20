import { storytellerConfirmMock } from '~/__mocks__/game-ui';
import { SeatAssignmentMode } from '~/game/seating';
import { TownSquare } from '~/game/town-square';
import { createBasicPlayers } from '~/__mocks__/player';

beforeAll(() => {
    storytellerConfirmMock.mockResolvedValue(true);
});

afterAll(() => {
    storytellerConfirmMock.mockReset();
});

describe('Test basic functionalities', () => {
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

    test('resit players after inserting new players', async () => {
        const numPlayers = 10;
        const players = await createBasicPlayers(numPlayers);
        const townsquare = await TownSquare.from(
            players,
            SeatAssignmentMode.NaturalInsert
        );

        expect(townsquare.getPlayerOnSeat(4)).toEqual(players[4]);

        const newPlayers = await createBasicPlayers(2);
        await townsquare.resit(
            (players) => players.unshift(...newPlayers),
            SeatAssignmentMode.NaturalOverwrite
        );

        expect(townsquare.getPlayerOnSeat(0)).toEqual(newPlayers[0]);

        const newSeatAssignment = townsquare.seatAssignment;
        expect(newSeatAssignment.unoccupied.size).toEqual(0);
        expect(newSeatAssignment.unassigned.size).toEqual(0);
    });
});
