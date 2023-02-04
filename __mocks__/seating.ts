import type { IPlayer } from '~/game/player';
import { SeatAssignment } from '~/game/seating/seat-assignment';
import { SeatAssignmentFromMode } from '~/game/seating/seat-assignment-factory';
import { SeatAssignmentMode } from '~/game/seating/seat-assignment-mode';
import { type ISeating, Seating } from '~/game/seating/seating';

export function createBasicSeating(numSeats: number): ISeating {
    return new Seating(numSeats);
}

export async function createSeatingAndAssignPlayers(
    players: Array<IPlayer>,
    seatAssignmentMode: SeatAssignmentMode = SeatAssignmentMode.NaturalInsert
): Promise<ISeating> {
    const seating = createBasicSeating(players.length);
    const seatAssignment =
        SeatAssignmentFromMode.getInstance().getSeatAssignment(
            seatAssignmentMode
        );
    const _sitResults = await SeatAssignment.assignAll(
        seatAssignment,
        seating,
        players
    );
    expect(seating.isAllOccupied).toBeTrue();
    return seating;
}
