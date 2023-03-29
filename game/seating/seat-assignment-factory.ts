import { Singleton } from '../common';
import type { IPlayer } from '../player/player';
import {
    AssignEmptySeats,
    AssignNotSatPlayers,
    type ISeatAssignment,
    RandomAssign,
    SeatAssignment,
} from './seat-assignment';
import { SeatAssignmentMode } from './seat-assignment-mode';

export interface ISeatAssignmentFactory<T> {
    getSeatAssignment(seatAssignmentType: T): ISeatAssignment;
}

class BaseSeatAssignmentFromMode
    implements ISeatAssignmentFactory<SeatAssignmentMode>
{
    getSeatAssignment<TPlayers extends Iterable<IPlayer> = Array<IPlayer>>(
        seatAssignmentMode: SeatAssignmentMode
    ): ISeatAssignment<TPlayers> {
        let seatAssignment = new SeatAssignment<TPlayers>();

        if (
            seatAssignmentMode === SeatAssignmentMode.NaturalInsert ||
            seatAssignmentMode === SeatAssignmentMode.RandomInsert
        ) {
            seatAssignment = new AssignEmptySeats(
                new AssignNotSatPlayers(seatAssignment)
            );
        }

        if (
            seatAssignmentMode === SeatAssignmentMode.RandomInsert ||
            seatAssignmentMode === SeatAssignmentMode.RandomOverwrite
        ) {
            seatAssignment = new RandomAssign(seatAssignment);
        }

        return seatAssignment;
    }
}

export const SeatAssignmentFromMode = Singleton<BaseSeatAssignmentFromMode>(
    BaseSeatAssignmentFromMode
);
