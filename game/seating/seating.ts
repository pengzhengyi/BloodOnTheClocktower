import { Generator } from '../collections';
import { clockwise, counterclockwise, shuffle } from '../common';
import type { IPlayer } from '../player';
import { Players } from '../players';
import { AnyPredicate, Direction, Predicate, TAUTOLOGY } from '../types';
import {
    AccessInvalidSeatPosition,
    NumberOfSeatNotPositive,
    PlayerNoNeighbors,
    PlayerNotSat,
    UnexpectedEmptySeat,
} from '../exception';
import { Seat, SitResult } from './seat';
import { SeatAssignmentMode } from './seat-assignment-mode';
import { InteractionEnvironment } from '~/interaction/environment';

interface SyncResult {
    occupiedSeatsMismatchUnassignedPlayer: Set<Seat>;
    assignedPlayerMismatchUnoccupiedSeats: Set<IPlayer>;
}

export class Seating {
    /**
     * Create seating from players with assigned seat numbers.
     *
     * @param players Players with assigned seat numbers. If a player does not have assigned seat number, storyteller will decide on the spot.
     * @returns A Seating where players with assigned seat will be sat and empty seats will be created when there are spaces between assigned seats.
     */
    static async of(players: Iterable<IPlayer>) {
        const seats: Array<Seat> = [];

        for (const player of players) {
            await new PlayerNotSat(player).throwWhen(
                (error) => error.player.seatNumber === undefined
            );
            const seatNumber = player.seatNumber!;

            seats[seatNumber] = new Seat(seatNumber);
            await seats[seatNumber].sit(player);
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

    static async from(
        players: Array<IPlayer> | Players,
        seatAssignmentMode: SeatAssignmentMode = SeatAssignmentMode.NaturalInsert
    ) {
        const seating = await Seating.init(players.length);
        await seating.assign(players, seatAssignmentMode);
        return seating;
    }

    static async init(numSeats: number) {
        const seats = await this.createSeats(numSeats);
        return new this(seats);
    }

    protected static async isSeatPlayerAlive(seat: Seat): Promise<boolean> {
        const player = seat.player;
        if (player === undefined) {
            return false;
        } else {
            return await player.alive;
        }
    }

    protected static async createSeats(numSeats: number): Promise<Array<Seat>> {
        numSeats = await this.validateNumSeats(numSeats);

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

    protected static async validateNumSeats(numSeats: number): Promise<number> {
        if (numSeats <= 0) {
            const error = new NumberOfSeatNotPositive(numSeats);
            await error.throwWhen((error) => error.correctedNumSeats <= 0);
            numSeats = error.correctedNumSeats;
        }

        return numSeats;
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

    getPlayerOnSeat(position: number): IPlayer | undefined {
        return this.getSeat(position).player;
    }

    async changeNumSeats(newNumSeats: number) {
        newNumSeats = await Seating.validateNumSeats(newNumSeats);

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

    async *getVoteOrder(nominatedPosition: number): AsyncGenerator<IPlayer> {
        const clockwiseSeats = this.iterateSeatsExcludingStart(
            nominatedPosition,
            Direction.Clockwise
        );

        for await (const seat of clockwiseSeats) {
            yield seat.player!;
        }

        const nominated = this.seats[nominatedPosition].player as IPlayer;
        yield nominated;
    }

    /**
     * Get the nearest seat satisfying a condition around a seat position and the distance.
     * @param seatPosition Seat position to start search at.
     * @param condition A condition that needs to be satisfied for a seat to be considered qualified.
     * @returns A seat satisfying the condition and its distance from start seat position. Neighboring seats have a distance of 1.
     */
    async getNearestSeat(
        seatPosition: number,
        condition: Predicate<Seat>
    ): Promise<[Seat, number] | undefined> {
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
                await clockwiseIterator.next());
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
                await counterclockwiseIterator.next());
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

    tryGetSeatByPlayer(player: IPlayer): Seat | undefined {
        const seatNum = player.seatNumber;

        if (seatNum === undefined) {
            return undefined;
        }

        return this.seats[seatNum];
    }

    async *iterateNeighbors(): AsyncIterable<[IPlayer, IPlayer]> {
        for (const seats of this.iterateNeighboringSeats()) {
            for (const seat of seats) {
                await new UnexpectedEmptySeat(this, seat).throwWhen(
                    (error) =>
                        error.emptySeat === undefined || error.emptySeat.isEmpty
                );
            }

            yield seats.map((seat) => seat.player!) as [IPlayer, IPlayer];
        }
    }

    /**
     * {@link `glossary["Neighbors"]`}
     * The two players, whether dead or alive, sitting one seat clockwise and counterclockwise from the player in question.
     */
    async getNeighbors(
        player: IPlayer,
        predicate?: AnyPredicate<Seat>
    ): Promise<[IPlayer, IPlayer]> {
        const seat = this.getSeatByPlayer(player);

        const neighbors = await Promise.all([
            this.getCounterclockwisePlayer(seat.position, predicate),
            this.getClockwisePlayer(seat.position, predicate),
        ]);

        if (neighbors[0] !== undefined && neighbors[1] !== undefined) {
            return [neighbors[0], neighbors[1]];
        } else {
            throw new PlayerNoNeighbors(player, neighbors, this);
        }
    }

    /**
     * {@link `glossary["Alive neighbours"]`}
     * The two alive players that are sitting closest—one clockwise, one counterclockwise—to the player in question, not including any dead players sitting between them.
     */
    async getAliveNeighbors(
        player: IPlayer,
        isAlive: AnyPredicate<Seat> = Seating.isSeatPlayerAlive
    ): Promise<[IPlayer, IPlayer]> {
        return await this.getNeighbors(player, isAlive);
    }

    async assign(
        players: Players | Array<IPlayer>,
        seatAssignmentMode: SeatAssignmentMode
    ): Promise<Array<SitResult>> {
        const sitResults: Array<SitResult> = [];

        for await (const sitResult of this.assignEach(
            players,
            seatAssignmentMode
        )) {
            sitResults.push(sitResult);
        }

        return sitResults;
    }

    async *assignEach(
        players: Players | Array<IPlayer>,
        seatAssignmentMode: SeatAssignmentMode
    ): AsyncGenerator<SitResult> {
        await this.fit(players.length);

        let unoccupied: Iterable<Seat>;
        let unassigned: Iterable<IPlayer>;

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

        for await (const sitResult of this.assignPlayersToSeats(
            unassigned,
            unoccupied,
            seatAssignmentMode === SeatAssignmentMode.RandomInsert ||
                seatAssignmentMode === SeatAssignmentMode.RandomOverwrite
        )) {
            yield sitResult;
        }
    }

    /**
     * Exchange the players sitting at specified seating positions.
     * @param seatPosition The position of one seat
     * @param otherSeatPosition The position of the other seat
     * @returns The sitting results when players exchange the seat. Can have length 0, 1, or 2.
     */
    async exchange(
        seatPosition: number,
        otherSeatPosition: number
    ): Promise<Array<SitResult>> {
        const seat = this.getSeat(seatPosition);
        const otherSeat = this.getSeat(otherSeatPosition);

        const [player, otherPlayer] = await Promise.all([
            seat.remove(),
            otherSeat.remove(),
        ]);

        const willSit: Array<Promise<SitResult>> = [];
        if (player !== undefined) {
            willSit.push(otherSeat.sit(player));
        }

        if (otherPlayer !== undefined) {
            willSit.push(seat.sit(otherPlayer));
        }

        return await Promise.all(willSit);
    }

    protected getSeatByPlayer(player: IPlayer): Seat {
        const seat = this.tryGetSeatByPlayer(player);

        if (seat === undefined) {
            throw new PlayerNotSat(player);
        }

        return seat;
    }

    protected async *assignPlayersToSeats(
        unassigned: Iterable<IPlayer>,
        unoccupied: Iterable<Seat>,
        shouldRandomlyAssign: boolean
    ): AsyncGenerator<SitResult> {
        let unassignedPlayers: Iterable<IPlayer>;

        if (shouldRandomlyAssign) {
            unassignedPlayers = shuffle(unassigned);
        } else {
            unassignedPlayers = unassigned;
        }

        for (const [unassignedPlayer, unoccupiedSeat] of Generator.pair(
            unassignedPlayers,
            unoccupied
        )) {
            yield await unoccupiedSeat.sit(unassignedPlayer);
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
     * @returns The result of syncing which describes the mismatches.
     */
    protected async sync(players: Iterable<IPlayer>): Promise<SyncResult> {
        const occupiedSeatsMismatchUnassignedPlayer = new Set<Seat>();
        const assignedPlayerMismatchUnoccupiedSeats = new Set<IPlayer>();

        const willSit: Array<Promise<SitResult>> = [];
        for (const player of players) {
            if (player.seatNumber !== undefined) {
                const matchingSeat = this.getSeat(player.seatNumber);

                if (matchingSeat.isEmpty) {
                    assignedPlayerMismatchUnoccupiedSeats.add(player);
                    willSit.push(matchingSeat.sit(player));
                }
            }
        }
        await Promise.all(willSit);

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
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
                this.formatPromptForSeatIncrease(numPlayers)
            )
        ) {
            await this.changeNumSeats(numPlayers);
            return true;
        }

        return false;
    }

    protected async *iterateSeatsExcludingStart(
        startSeatPosition: number,
        direction: Direction,
        filterSeat: AnyPredicate<Seat> = TAUTOLOGY
    ): AsyncGenerator<Seat> {
        if (startSeatPosition < 0 || startSeatPosition >= this.numSeats) {
            return;
        }

        const iterate =
            direction === Direction.Clockwise ? clockwise : counterclockwise;

        let isFirst = true;
        for (const neighborSeat of iterate(this.seats, startSeatPosition)) {
            if (isFirst) {
                isFirst = false;
            } else if (await filterSeat(neighborSeat)) {
                yield neighborSeat;
            }
        }
    }

    protected iterateNeighboringSeats(): Iterable<[Seat, Seat]> {
        return Generator.pair(
            clockwise(this.seats, 0),
            clockwise(this.seats, 1)
        );
    }

    protected async tryGetNextSeat(
        seatPosition: number,
        filterSeat?: AnyPredicate<Seat>
    ): Promise<Seat | undefined> {
        const neighbors = this.iterateSeatsExcludingStart(
            seatPosition,
            Direction.Clockwise,
            filterSeat
        );
        return (await neighbors.next()).value;
    }

    protected async getClockwisePlayer(
        seatPosition: number,
        filterSeat?: AnyPredicate<Seat>
    ): Promise<IPlayer | undefined> {
        const nextSeat = await this.tryGetNextSeat(seatPosition, filterSeat);

        if (nextSeat !== undefined) {
            await new UnexpectedEmptySeat(this, nextSeat).throwWhen(
                (error) => error.emptySeat.player === undefined
            );
        }

        return nextSeat?.player;
    }

    protected async tryGetPrevSeat(
        seatPosition: number,
        filterSeat?: AnyPredicate<Seat>
    ): Promise<Seat | undefined> {
        const neighbors = this.iterateSeatsExcludingStart(
            seatPosition,
            Direction.Counterclockwise,
            filterSeat
        );
        return (await neighbors.next()).value;
    }

    protected async getCounterclockwisePlayer(
        seatPosition: number,
        filterSeat?: AnyPredicate<Seat>
    ): Promise<IPlayer | undefined> {
        const prevSeat = await this.tryGetPrevSeat(seatPosition, filterSeat);

        if (prevSeat !== undefined) {
            await new UnexpectedEmptySeat(this, prevSeat).throwWhen(
                (error) => error.emptySeat.player === undefined
            );
        }

        return prevSeat?.player;
    }

    protected formatPromptForSeatIncrease(newSize: number) {
        return `Increase number of seats to ${newSize} to fit all players`;
    }
}
