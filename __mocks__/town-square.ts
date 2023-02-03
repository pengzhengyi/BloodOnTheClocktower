import { mockClocktower } from './clocktower';
import { createSeatingAndAssignPlayers } from './seating';
import type { IClocktower } from '~/game/clocktower';
import type { IPlayer } from '~/game/player';
import { SeatAssignmentMode } from '~/game/seating/seat-assignment-mode';
import { ITownSquare, TownSquare } from '~/game/town-square';

export async function createTownSquare(
    players: Array<IPlayer>,
    seatAssignmentMode: SeatAssignmentMode = SeatAssignmentMode.NaturalInsert,
    clocktower?: IClocktower
): Promise<ITownSquare> {
    clocktower ??= mockClocktower();
    const seating = await createSeatingAndAssignPlayers(
        players,
        seatAssignmentMode
    );
    return new TownSquare(seating, clocktower);
}
