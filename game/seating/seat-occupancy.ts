import type { IPlayer } from '../player/player';
import type { ISeat } from './seat';

export interface ISeatOccupancy {
    unoccupied: Set<ISeat>;
    unassigned: Set<IPlayer>;
    occupied: Set<ISeat>;
    assigned: Set<IPlayer>;
}

export class SeatOccupancy implements ISeatOccupancy {
    unoccupied: Set<ISeat> = new Set();

    unassigned: Set<IPlayer> = new Set();

    occupied: Set<ISeat> = new Set();

    assigned: Set<IPlayer> = new Set();

    constructor(seats: Iterable<ISeat>, players: Iterable<IPlayer>) {
        this.getSeatAssignment(seats, players);
    }

    protected getSeatAssignment(
        seats: Iterable<ISeat>,
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
