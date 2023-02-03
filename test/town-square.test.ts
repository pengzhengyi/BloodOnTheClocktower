import { storytellerConfirmMock } from '~/__mocks__/game-ui';
import { createBasicPlayers } from '~/__mocks__/player';
import { SeatAssignmentMode } from '~/game/seating/seat-assignment-mode';
import { Seating } from '~/game/seating/seating';
import { createTownSquare } from '~/__mocks__/town-square';
import { SeatAssignmentFromMode } from '~/game/seating/seat-assignment-factory';
import { SeatAssignment } from '~/game/seating/seat-assignment';

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
        const townsquare = await createTownSquare(
            players,
            SeatAssignmentMode.RandomInsert
        );

        const seatOccupancy = Seating.getSeatOccupancy(
            townsquare.seating,
            players
        );
        expect(seatOccupancy.unoccupied.size).toEqual(0);
        expect(seatOccupancy.unassigned.size).toEqual(0);
        expect(seatOccupancy.occupied.size).toEqual(numPlayers);
        expect(seatOccupancy.assigned.size).toEqual(numPlayers);
    });

    test('resit players after inserting new players', async () => {
        const numPlayers = 10;
        const players = await createBasicPlayers(numPlayers);
        const townsquare = await createTownSquare(
            players,
            SeatAssignmentMode.NaturalInsert
        );

        expect(Seating.getPlayerOnSeat(townsquare.seating, 4)).toEqual(
            players[4]
        );

        const newPlayers = await createBasicPlayers(2);
        expect(players.unshift(...newPlayers)).toEqual(12);

        const seatAssignment =
            SeatAssignmentFromMode.getInstance().getSeatAssignment(
                SeatAssignmentMode.NaturalOverwrite
            );
        const _sitResults = await SeatAssignment.assignAll(
            seatAssignment,
            townsquare.seating,
            players
        );

        expect(Seating.getPlayerOnSeat(townsquare.seating, 0)).toEqual(
            newPlayers[0]
        );

        const newSeatOccupancy = Seating.getSeatOccupancy(
            townsquare.seating,
            players
        );
        expect(newSeatOccupancy.unoccupied.size).toEqual(0);
        expect(newSeatOccupancy.unassigned.size).toEqual(0);
    });
});
