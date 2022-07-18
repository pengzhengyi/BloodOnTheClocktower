import { Generator } from './collections';
import { clockwise, counterclockwise } from './common';
import { NumberOfSeatNotPositive } from './exception';
import { Player } from './player';
import { Seat } from './seat';
import { Direction, Predicate, TAUTOLOGY } from './types';

export class Seating {
    // static async from(players: Iterable<Player>) {
    //     const seats = [];

    //     for (const player of players) {
    //         await new PlayerNotSat(player).throwWhen(error => error.player.seatNumber === undefined);
    //         const seatNumber = player.seatNumber!;

    //         // const seat = seats[seatNumber] = new Sea
    //     }

    // }

    static async init(numSeats: number) {
        const seats = await this.createSeats(numSeats);
        return new this(seats);
    }

    protected static async createSeats(numSeats: number): Promise<Array<Seat>> {
        if (numSeats <= 0) {
            const error = new NumberOfSeatNotPositive(numSeats);
            await error.throwWhen((error) => error.correctedNumSeats <= 0);
            numSeats = error.correctedNumSeats;
        }

        return Array.from(
            Generator.map(
                (seatNumber) => new Seat(seatNumber),
                Generator.range(0, numSeats)
            )
        );
    }

    get allSat(): boolean {
        return this.seats.every((seat) => seat.isOccupied);
    }

    protected constructor(public readonly seats: Array<Seat>) {
        this.seats = seats;
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

    getNearestSeat(
        seat: Seat,
        condition: Predicate<Seat>
    ): [number, Seat] | undefined {
        const clockwiseIterator = this.iterateSeats(
            seat,
            Direction.Clockwise,
            condition
        );
        const counterclockwiseIterator = this.iterateSeats(
            seat,
            Direction.Counterclockwise,
            condition
        );

        let isClockwiseIterated;
        let isCounterclockwiseIterated;
        let clockwiseSeat;
        let counterclockwiseSeat;
        let clockwiseDistance = 0;
        let counterclockwiseDistance = 0;

        while (true) {
            ({ done: isClockwiseIterated, value: clockwiseSeat } =
                clockwiseIterator.next());
            if (Object.is(clockwiseSeat, counterclockwiseSeat)) {
                return undefined;
            }
            if (isClockwiseIterated) {
                return undefined;
            }
            clockwiseDistance++;
            if (condition(clockwiseSeat)) {
                return [clockwiseDistance, clockwiseSeat];
            }

            ({ done: isCounterclockwiseIterated, value: counterclockwiseSeat } =
                counterclockwiseIterator.next());
            if (Object.is(clockwiseSeat, counterclockwiseSeat)) {
                return undefined;
            }
            if (isCounterclockwiseIterated) {
                return undefined;
            }
            counterclockwiseDistance++;
            if (condition(counterclockwiseSeat)) {
                return [counterclockwiseDistance, counterclockwiseSeat];
            }
        }
    }

    findSeatByPlayer(player: Player): Seat | undefined {
        const seatNum = player.seatNumber;

        if (seatNum === undefined) {
            return undefined;
        }

        return this.seats[seatNum];
    }
}
