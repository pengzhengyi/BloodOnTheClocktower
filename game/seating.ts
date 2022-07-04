import { Player } from './player';
import { Seat } from './seat';

export class Seating {
    public readonly seats: Array<Seat>;

    get allSat(): boolean {
        return this.seats.every((seat) => seat.sat);
    }

    static *createSeats(numSeats: number): IterableIterator<Seat> {
        for (let i = 1; i <= numSeats; i++) {
            yield new Seat(i);
        }
    }

    constructor(initialNumSeats: number) {
        this.seats = Array.from(Seating.createSeats(initialNumSeats));
    }

    getClockwiseNeighbor(seat: Seat): Seat {
        const seatPosition = seat.position;
        const numSeats = this.seats.length;
        const neighborSeatPosition = (seatPosition + 1) % numSeats;
        return this.seats[neighborSeatPosition];
    }

    getCounterClockwiseNeighbor(seat: Seat): Seat {
        const seatPosition = seat.position;
        const numSeats = this.seats.length;
        const neighborSeatPosition = (seatPosition - 1 + numSeats) % numSeats;
        return this.seats[neighborSeatPosition];
    }

    *getPlayers(skipEmptySeats: boolean): IterableIterator<Player | undefined> {
        for (const seat of this.seats) {
            if (seat.sat) {
                yield seat.player!;
            } else if (!skipEmptySeats) {
                yield undefined;
            }
        }
    }
}
