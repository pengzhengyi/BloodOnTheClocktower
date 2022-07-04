import { clockwise, counterclockwise } from './common';
import { NumberOfSeatNotPositive } from './exception';
import { Player } from './player';
import { Seat } from './seat';
import { Direction, Predicate, TAUTOLOGY } from './types';

export class Seating {
    public readonly seats: Array<Seat>;

    get allSat(): boolean {
        return this.seats.every((seat) => seat.sat);
    }

    protected static *createSeats(numSeats: number): IterableIterator<Seat> {
        if (numSeats <= 0) {
            throw new NumberOfSeatNotPositive(numSeats);
        }

        for (let i = 1; i <= numSeats; i++) {
            yield new Seat(i);
        }
    }

    constructor(initialNumSeats: number) {
        this.seats = Array.from(Seating.createSeats(initialNumSeats));
    }

    *iterateSeats(
        startSeat: Seat,
        direction: Direction,
        filterSeat: Predicate<Seat> = TAUTOLOGY
    ): IterableIterator<Seat> {
        const iterate =
            direction === Direction.Clockwise ? clockwise : counterclockwise;

        let isFirst = true;
        for (const neighborSeat of iterate(this.seats, startSeat.position)) {
            if (isFirst) {
                isFirst = false;
            } else if (filterSeat(neighborSeat)) {
                yield neighborSeat;
            }
        }
    }

    getNextSeat(
        seat: Seat,
        filterSeat: Predicate<Seat> | undefined = undefined
    ): Seat {
        const neighbors = this.iterateSeats(
            seat,
            Direction.Clockwise,
            filterSeat
        );
        return neighbors.next().value;
    }

    getPrevSeat(
        seat: Seat,
        filterSeat: Predicate<Seat> | undefined = undefined
    ): Seat {
        const neighbors = this.iterateSeats(
            seat,
            Direction.Counterclockwise,
            filterSeat
        );
        return neighbors.next().value;
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

    findSeatByPlayer(player: Player): Seat | undefined {
        return this.seats.find((seat) => Object.is(seat.player, player));
    }
}
