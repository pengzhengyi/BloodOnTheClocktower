import { Generator } from './collections';
import { clockwise, counterclockwise, shuffle } from './common';
import { Player } from './player';
import { Players } from './players';
import { Seat } from './seat';
import { Direction, Predicate, TAUTOLOGY } from './types';
import {
    AccessInvalidSeatPosition,
    NumberOfSeatNotPositive,
    PlayerNoAliveNeighbors,
    PlayerNoNeighbors,
    PlayerNotSat,
    UnexpectedEmptySeat,
} from './exception';
import { GAME_UI } from '~/interaction/gameui';

export interface SyncResult {
    occupiedSeatsMismatchUnassignedPlayer: Set<Seat>;
    assignedPlayerMismatchUnoccupiedSeats: Set<Player>;
}

export class SeatAssignment {
    unoccupied: Set<Seat> = new Set();

    unassigned: Set<Player> = new Set();

    occupied: Set<Seat> = new Set();

    assigned: Set<Player> = new Set();

    constructor(seats: Iterable<Seat>, players: Iterable<Player>) {
        this.getSeatAssignment(seats, players);
    }

    protected getSeatAssignment(
        seats: Iterable<Seat>,
        players: Iterable<Player>
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

export enum SeatAssignmentMode {
    NaturalInsert = 0,
    RandomInsert = 1,
    NaturalOverwrite = 2,
    RandomOverwrite = 3,
}

export class Seating {
    /**
     * Create seating from players with assigned seat numbers.
     *
     * @param players Players with assigned seat numbers. If a player does not have assigned seat number, storyteller will decide on the spot.
     * @returns A Seating where players with assigned seat will be sat and empty seats will be created when there are spaces between assigned seats.
     */
    static async from(players: Iterable<Player>) {
        const seats: Array<Seat> = [];

        for (const player of players) {
            await new PlayerNotSat(player).throwWhen(
                (error) => error.player.seatNumber === undefined
            );
            const seatNumber = player.seatNumber!;

            seats[seatNumber] = await Seat.init(seatNumber, player);
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
        await this.validateNumSeats(numSeats);

        return this.createConsecutiveSeats(0, numSeats);
    }

    protected static createConsecutiveSeats(
        start: number,
        stop: number
    ): Array<Seat> {
        return Array.from(
            Generator.map(
                (seatNumber) => new Seat(seatNumber),
                Generator.range(start, stop)
            )
        );
    }

    protected static async validateNumSeats(numSeats: number) {
        if (numSeats <= 0) {
            const error = new NumberOfSeatNotPositive(numSeats);
            await error.throwWhen((error) => error.correctedNumSeats <= 0);
            numSeats = error.correctedNumSeats;
        }
    }

    get allSat(): boolean {
        return this.seats.every((seat) => seat.isOccupied);
    }

    get numSeats(): number {
        return this.seats.length;
    }

    protected constructor(public readonly seats: Array<Seat>) {
        this.seats = seats;
    }

    [Symbol.iterator]() {
        return this.seats[Symbol.iterator]();
    }

    getSeat(position: number): Seat {
        if (position < 0 || position > this.numSeats) {
            throw new AccessInvalidSeatPosition(position, this);
        }

        return this.seats[position];
    }

    async *sit(players: Iterable<Player>): AsyncGenerator<boolean> {
        for (const [player, seat] of Generator.pair(players, this.seats)) {
            yield await seat.sit(player);
        }
    }

    async changeNumSeats(newNumSeats: number) {
        await Seating.validateNumSeats(newNumSeats);

        const numSeats = this.numSeats;
        if (newNumSeats < numSeats) {
            for (let i = newNumSeats; i < numSeats; i++) {
                await this.seats[i].remove();
            }
            this.seats.length = newNumSeats;
        } else if (newNumSeats > numSeats) {
            const newSeats = Seating.createConsecutiveSeats(
                numSeats,
                newNumSeats
            );
            return this.seats.push(...newSeats);
        }
    }

    tryGetNextSeat(
        seatPosition: number,
        filterSeat?: Predicate<Seat>
    ): Seat | undefined {
        const neighbors = this.iterateSeatsExcludingStart(
            seatPosition,
            Direction.Clockwise,
            filterSeat
        );
        return neighbors.next().value;
    }

    async getClockwisePlayer(
        seatPosition: number,
        filterSeat?: Predicate<Seat>
    ): Promise<Player | undefined> {
        const nextSeat = this.tryGetNextSeat(seatPosition, filterSeat);

        if (nextSeat !== undefined) {
            await new UnexpectedEmptySeat(nextSeat).throwWhen(
                (error) => error.emptySeat.player === undefined
            );
        }

        return nextSeat?.player;
    }

    tryGetPrevSeat(
        seatPosition: number,
        filterSeat?: Predicate<Seat>
    ): Seat | undefined {
        const neighbors = this.iterateSeatsExcludingStart(
            seatPosition,
            Direction.Counterclockwise,
            filterSeat
        );
        return neighbors.next().value;
    }

    async getCounterclockwisePlayer(
        seatPosition: number,
        filterSeat?: Predicate<Seat>
    ): Promise<Player | undefined> {
        const prevSeat = this.tryGetPrevSeat(seatPosition, filterSeat);

        if (prevSeat !== undefined) {
            await new UnexpectedEmptySeat(prevSeat).throwWhen(
                (error) => error.emptySeat.player === undefined
            );
        }

        return prevSeat?.player;
    }

    async *getVoteOrder(nominatedPosition: number): AsyncGenerator<Player> {
        const clockwiseSeats = this.iterateSeatsExcludingStart(
            nominatedPosition,
            Direction.Clockwise
        );

        for (const seat of Generator.push(
            clockwiseSeats,
            this.seats[nominatedPosition]
        )) {
            await new UnexpectedEmptySeat(seat).throwWhen(
                (error) => error.emptySeat.player === undefined
            );
            yield seat.player!;
        }
    }

    /**
     * Get the nearest seat satisfying a condition around a seat position and the distance.
     * @param seatPosition Seat position to start search at.
     * @param condition A condition that needs to be satisfied for a seat to be considered qualified.
     * @returns A seat satisfying the condition and its distance from start seat position. Neighboring seats have a distance of 1.
     */
    getNearestSeat(
        seatPosition: number,
        condition: Predicate<Seat>
    ): [Seat, number] | undefined {
        const clockwiseIterator = this.iterateSeatsExcludingStart(
            seatPosition,
            Direction.Clockwise,
            condition
        );
        const counterclockwiseIterator = this.iterateSeatsExcludingStart(
            seatPosition,
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
            if (isClockwiseIterated) {
                return undefined;
            }
            if (Object.is(clockwiseSeat, counterclockwiseSeat)) {
                return undefined;
            }

            clockwiseDistance++;
            if (condition(clockwiseSeat)) {
                return [clockwiseSeat, clockwiseDistance];
            }

            ({ done: isCounterclockwiseIterated, value: counterclockwiseSeat } =
                counterclockwiseIterator.next());
            if (isCounterclockwiseIterated) {
                return undefined;
            }
            if (Object.is(clockwiseSeat, counterclockwiseSeat)) {
                return undefined;
            }

            counterclockwiseDistance++;
            if (condition(counterclockwiseSeat)) {
                return [counterclockwiseSeat, counterclockwiseDistance];
            }
        }
    }

    tryGetSeatByPlayer(player: Player): Seat | undefined {
        const seatNum = player.seatNumber;

        if (seatNum === undefined) {
            return undefined;
        }

        return this.seats[seatNum];
    }

    async getSeatByPlayer(player: Player): Promise<Seat> {
        const checkPlayerSat = new PlayerNotSat(player);
        await checkPlayerSat.throwWhen(
            (error) => this.tryGetSeatByPlayer(error.player) === undefined
        );
        return this.tryGetSeatByPlayer(checkPlayerSat.player)!;
    }

    /**
     * {@link `glossary["Neighbors"]`}
     * The two players, whether dead or alive, sitting one seat clockwise and counterclockwise from the player in question.
     */
    async getNeighbors(player: Player): Promise<[Player, Player]> {
        const seat = await this.getSeatByPlayer(player);

        const neighbors = await Promise.all([
            this.getCounterclockwisePlayer(seat.position),
            this.getClockwisePlayer(seat.position),
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
        const seat = await this.getSeatByPlayer(player);

        const neighbors = await Promise.all([
            this.getCounterclockwisePlayer(
                seat.position,
                (seat) => seat.player?.alive ?? false
            ),
            this.getClockwisePlayer(
                seat.position,
                (seat) => seat.player?.alive ?? false
            ),
        ]);

        if (neighbors[0] !== undefined && neighbors[1] !== undefined) {
            return [neighbors[0], neighbors[1]];
        } else {
            throw new PlayerNoAliveNeighbors(player, neighbors, this);
        }
    }

    async assign(
        players: Players | Array<Player>,
        seatAssignmentMode: SeatAssignmentMode
    ): Promise<void> {
        await this.fit(players.length);

        let unoccupied: Iterable<Seat>;
        let unassigned: Iterable<Player>;

        if (seatAssignmentMode < SeatAssignmentMode.NaturalOverwrite) {
            await this.sync(players);

            unoccupied = Generator.filter((seat) => seat.isEmpty, this.seats);

            unassigned = Generator.filter(
                (player) => player.seatNumber === undefined,
                players
            );
        } else {
            unoccupied = this.seats;
            unassigned = players;
        }

        await this.assignPlayersToSeats(
            unassigned,
            unoccupied,
            seatAssignmentMode === SeatAssignmentMode.RandomInsert ||
                seatAssignmentMode === SeatAssignmentMode.RandomOverwrite
        );
    }

    protected async assignPlayersToSeats(
        unassigned: Iterable<Player>,
        unoccupied: Iterable<Seat>,
        shouldRandomlyAssign: boolean
    ): Promise<void> {
        let unassignedPlayers: Iterable<Player>;

        if (shouldRandomlyAssign) {
            unassignedPlayers = shuffle(unassigned);
        } else {
            unassignedPlayers = unassigned;
        }

        for (const [unassignedPlayer, unoccupiedSeat] of Generator.pair(
            unassignedPlayers,
            unoccupied
        )) {
            await unoccupiedSeat.sit(unassignedPlayer);
        }
    }

    /**
     * Sync players' seat assignment with seats' occupancy.
     *
     * It will fix the following mismatch:
     *
     * - a player is assigned a seat but the seat appears to be empty (when player is pre-assigned)
     * - a seat is occupied by a player but the player does not have this seat number assigned (rare, indicates a bug)
     *
     * ! It will not handle when a player is assigned a seat which is occupied by a different player.
     * ! It will throw an error when there are fewer seats than the number of players.
     *
     * @param players
     * @returns
     */
    protected async sync(players: Iterable<Player>): Promise<SyncResult> {
        const occupiedSeatsMismatchUnassignedPlayer = new Set<Seat>();
        const assignedPlayerMismatchUnoccupiedSeats = new Set<Player>();

        for (const player of players) {
            if (player.seatNumber !== undefined) {
                const matchingSeat = this.getSeat(player.seatNumber);

                if (matchingSeat.isEmpty) {
                    assignedPlayerMismatchUnoccupiedSeats.add(player);
                    await matchingSeat.sit(player);
                }
            }
        }

        for (const seat of this) {
            if (seat.isOccupied && seat.player!.seatNumber === undefined) {
                occupiedSeatsMismatchUnassignedPlayer.add(seat);
                seat.player!.seatNumber = seat.position;
            }
        }

        return {
            occupiedSeatsMismatchUnassignedPlayer,
            assignedPlayerMismatchUnoccupiedSeats,
        };
    }

    /**
     * Try to increase number of seats to accommodate all the players when necessary.
     * @param numPlayers Number of players should fit.
     * @returns Whether the number of seats can fit all players.
     */
    protected async fit(numPlayers: number): Promise<boolean> {
        if (numPlayers <= this.numSeats) {
            return true;
        }

        if (
            await GAME_UI.storytellerConfirm(
                this.formatPromptForSeatIncrease(numPlayers)
            )
        ) {
            await this.changeNumSeats(numPlayers);
            return true;
        }

        return false;
    }

    protected *iterateSeatsExcludingStart(
        startSeatPosition: number,
        direction: Direction,
        filterSeat: Predicate<Seat> = TAUTOLOGY
    ): IterableIterator<Seat> {
        if (startSeatPosition < 0 || startSeatPosition >= this.numSeats) {
            return;
        }

        const iterate =
            direction === Direction.Clockwise ? clockwise : counterclockwise;

        let isFirst = true;
        for (const neighborSeat of iterate(this.seats, startSeatPosition)) {
            if (isFirst) {
                isFirst = false;
            } else if (filterSeat(neighborSeat)) {
                yield neighborSeat;
            }
        }
    }

    protected formatPromptForSeatIncrease(newSize: number) {
        return `Increase number of seats to ${newSize} to fit all players`;
    }
}
