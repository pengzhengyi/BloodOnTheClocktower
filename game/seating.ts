import { Generator } from './collections';
import { clockwise, counterclockwise } from './common';
import {
    NumberOfSeatNotPositive,
    PlayerNoAliveNeighbors,
    PlayerNoNeighbors,
    PlayerNotSat,
    UnexpectedEmptySeat,
} from './exception';
import { Player } from './player';
import { Seat } from './seat';
import { Direction, Predicate, TAUTOLOGY } from './types';

export class Seating {
    static unsafeFrom(players: Iterable<Player>) {
        const seats: Array<Seat> = [];

        for (const player of players) {
            const seatNumber = player.seatNumber!;
            seats[seatNumber] = new Seat(seatNumber, player);
        }

        return new this(seats);
    }

    static async from(players: Iterable<Player>) {
        const seats: Array<Seat> = [];

        for (const player of players) {
            await new PlayerNotSat(player).throwWhen(
                (error) => error.player.seatNumber === undefined
            );
            const seatNumber = player.seatNumber!;

            seats[seatNumber] = new Seat(seatNumber, player);
        }

        for (
            let seatPosition = 0;
            seatPosition < seats.length;
            seatPosition++
        ) {
            if (seats[seatPosition] === undefined) {
                seats[seatPosition] = new Seat(seatPosition);
            }
        }

        return new this(seats);
    }

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

    async getClockwisePlayer(
        seat: Seat,
        filterSeat: Predicate<Seat> | undefined = undefined
    ): Promise<Player | undefined> {
        const nextSeat = this.tryGetNextSeat(seat, filterSeat);

        if (nextSeat !== undefined) {
            const checkSeatOccupied = new UnexpectedEmptySeat(nextSeat);
            await checkSeatOccupied.throwWhen(
                (error) => error.emptySeat.player === undefined
            );
        }

        return nextSeat?.player;
    }

    tryGetNextSeat(
        seat: Seat,
        filterSeat: Predicate<Seat> | undefined = undefined
    ): Seat | undefined {
        const neighbors = this.iterateSeats(
            seat,
            Direction.Clockwise,
            filterSeat
        );
        return neighbors.next().value;
    }

    async getCounterclockwisePlayer(
        seat: Seat,
        filterSeat: Predicate<Seat> | undefined = undefined
    ): Promise<Player | undefined> {
        const prevSeat = this.tryGetPrevSeat(seat, filterSeat);

        if (prevSeat !== undefined) {
            const checkSeatOccupied = new UnexpectedEmptySeat(prevSeat);
            await checkSeatOccupied.throwWhen(
                (error) => error.emptySeat.player === undefined
            );
        }

        return prevSeat?.player;
    }

    tryGetPrevSeat(
        seat: Seat,
        filterSeat: Predicate<Seat> | undefined = undefined
    ): Seat | undefined {
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

    tryFindSeatByPlayer(player: Player): Seat | undefined {
        const seatNum = player.seatNumber;

        if (seatNum === undefined) {
            return undefined;
        }

        return this.seats[seatNum];
    }

    async findSeatByPlayer(player: Player): Promise<Seat> {
        const checkPlayerSat = new PlayerNotSat(player);
        await checkPlayerSat.throwWhen(
            (error) => this.tryFindSeatByPlayer(error.player) === undefined
        );
        return this.tryFindSeatByPlayer(checkPlayerSat.player)!;
    }

    /**
     * {@link `glossary["Neighbors"]`}
     * The two players, whether dead or alive, sitting one seat clockwise and counterclockwise from the player in question.
     */
    async getNeighbors(player: Player): Promise<[Player, Player]> {
        const seat = await this.findSeatByPlayer(player);

        const neighbors = await Promise.all([
            this.getCounterclockwisePlayer(seat),
            this.getClockwisePlayer(seat),
        ]);

        if (neighbors[0] !== undefined && neighbors[1] !== undefined) {
            return [neighbors[0], neighbors[1]];
        } else {
            throw new PlayerNoNeighbors(player, neighbors, this);
        }
    }

    /**
     * {@link `glossary["Alive neighbours:"]`}
     * The two alive players that are sitting closest—one clockwise, one counterclockwise—to the player in question, not including any dead players sitting between them.
     */
    async getAliveNeighbors(player: Player): Promise<[Player, Player]> {
        const seat = await this.findSeatByPlayer(player);

        const neighbors = await Promise.all([
            this.getCounterclockwisePlayer(
                seat,
                (seat) => seat.player?.alive ?? false
            ),
            this.getClockwisePlayer(
                seat,
                (seat) => seat.player?.alive ?? false
            ),
        ]);

        if (neighbors[0] !== undefined && neighbors[1] !== undefined) {
            return [neighbors[0], neighbors[1]];
        } else {
            throw new PlayerNoAliveNeighbors(player, neighbors, this);
        }
    }
}
