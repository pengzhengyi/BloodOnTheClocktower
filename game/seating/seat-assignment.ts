import type { IPlayer } from '../player';
import type { Seat } from './seat';

export interface ISeatAssignment {
    unoccupied: Set<Seat>;
    unassigned: Set<IPlayer>;
    occupied: Set<Seat>;
    assigned: Set<IPlayer>;
}

export class SeatAssignment implements ISeatAssignment {
    unoccupied: Set<Seat> = new Set();

    unassigned: Set<IPlayer> = new Set();

    occupied: Set<Seat> = new Set();

    assigned: Set<IPlayer> = new Set();

    constructor(seats: Iterable<Seat>, players: Iterable<IPlayer>) {
        this.getSeatAssignment(seats, players);
    }

    protected getSeatAssignment(
        seats: Iterable<Seat>,
        players: Iterable<IPlayer>
    ) {
        for (const seat of seats) {
            if (seat.isEmpty) {
                this.unoccupied.add(seat);
            } else {
                this.occupied.add(seat);
                this.assigned.add(seat.player!);
            }
        }

        for (const player of players) {
            if (!this.assigned.has(player)) {
                this.unassigned.add(player);
            }
        }
    }
}
