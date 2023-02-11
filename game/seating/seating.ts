import { Generator } from '../collections';
import { clockwise, counterclockwise } from '../common';
import type { IPlayer } from '../player';
import { type AnyPredicate, Direction, TAUTOLOGY } from '../types';
import { NumberOfSeatNotPositive } from '../exception/number-of-seat-not-positive';
import { UnexpectedEmptySeat } from '../exception/unexpected-empty-seat';
import { PlayerNotSat } from '../exception/player-not-sat';
import { AccessInvalidSeatPosition } from '../exception/access-invalid-seat-position';
import { PlayerNoAliveNeighbors } from '../exception/player-no-alive-neighbors';
import { PlayerNoNeighbors } from '../exception/player-no-neighbors';
import { type ISeatOccupancy, SeatOccupancy } from './seat-occupancy';
import { type ISeat, Seat, type SitResult } from './seat';
import { iterableToString } from '~/utils/common';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface ISeating extends Iterable<ISeat> {
    readonly numSeats: number;
    readonly isAllOccupied: boolean;

    isOccupied(seatNumber: number): boolean;
    getSeat(seatNumber: number): ISeat;
    addSeat(): ISeat;
    setNumSeats(newNumSeats: number): Promise<void>;

    // sit player to seat or remove player from seat, these methods should be used rather than operate on seats
    /**
     * These are four scenarios when trying to sit a player to a seat, depending on whether the player is already assigned a seat and whether the seat is already occupied.
     *
     * - Assigned Player and Occupied Seat
     * - Assigned Player and Unoccupied Seat
     * - Unassigned Player and Occupied Seat
     * - Unassigned Player and Unoccupied Seat
     *
     * `trySit` will only succeed for the last case: when an unassigned player try to sit an unoccupied Seat.
     *
     * Try to sit a player to current seat. Will fail immediately when the seat is occupied.
     * @param player A player attempt to sit.
     * @param seatNumber A seat position for the player.
     * @returns The result of sitting.
     */
    trySit(player: IPlayer, seatNumber: number): SitResult;
    /**
     * These are four scenarios when trying to sit a player to a seat, depending on whether the player is already assigned a seat and whether the seat is already occupied.
     *
     * - Assigned Player and Occupied Seat
     * - Assigned Player and Unoccupied Seat
     * - Unassigned Player and Occupied Seat
     * - Unassigned Player and Unoccupied Seat
     *
     * For the last case, when an unassigned player try to sit an unoccupied, `sit` will behave like `trySit`. For other cases, `sit` might require confirmation for removing an already assigned player from its seat and emptying an occupied seat, making this call asynchronous.
     *
     * ! For the first two scenario, `sit` does not guarantee removing a player from its existing assigned seat. `ISeating.sit` should be used instead as it does proper cleaning up. In fact, `ISeating.sit` should be preferred when possible as the safer alternative.
     *
     * Sit a player at designated seat position. If the player is assigned to a seat, will remove the player from that assigned seat.  If the seat is occupied, will try to remove sat player before sit the new player.
     * @param player A player attempt to sit.
     * @param seatNumber A seat position for the player.
     * @returns The result of sitting.
     */
    sit(player: IPlayer, seatNumber: number): Promise<SitResult>;
    /**
     * Remove player (if sat) from its assigned seat.
     * @returns True if removed; false otherwise.
     */
    remove(player: IPlayer): Promise<boolean>;

    iterate(
        startSeatNumber: number,
        direction: Direction
    ): IterableIterator<ISeat>;

    toString(): string;
}

export class Seating implements ISeating {
    static DEFAULT_INITIAL_NUM_SEATS = 5;

    static getSafeIndex(seating: ISeating, unsafeSeatNumber: number): number {
        return (unsafeSeatNumber + seating.numSeats) % seating.numSeats;
    }

    static *getVoteOrder(
        seating: ISeating,
        nominatedPosition: number
    ): IterableIterator<IPlayer> {
        for (const seat of seating.iterate(
            this.getSafeIndex(seating, nominatedPosition + 1),
            Direction.Clockwise
        )) {
            if (seat.isOccupied) {
                yield seat.player as IPlayer;
            } else {
                throw new UnexpectedEmptySeat(seating, seat);
            }
        }
    }

    static getNeighboringSeats(
        seating: ISeating,
        seatNumber: number
    ): [ISeat, ISeat] {
        const numSeats = seating.numSeats;
        let nextSeatNumber = seatNumber + 1;
        if (nextSeatNumber === numSeats) {
            nextSeatNumber = 0;
        }

        const prevSeatNumber = seatNumber === 0 ? numSeats - 1 : seatNumber - 1;

        return [
            seating.getSeat(prevSeatNumber),
            seating.getSeat(nextSeatNumber),
        ];
    }

    static getPlayerOnSeat(
        seating: ISeating,
        position: number
    ): IPlayer | undefined {
        return seating.getSeat(position).player;
    }

    static getSeatOccupancy(
        seating: ISeating,
        players: Iterable<IPlayer>
    ): ISeatOccupancy {
        return new SeatOccupancy(seating, players);
    }

    static getNeighboringSeatPairs(
        seating: ISeating
    ): Iterable<[ISeat, ISeat]> {
        return Generator.pair(
            seating.iterate(0, Direction.Clockwise),
            seating.iterate(1, Direction.Clockwise)
        );
    }

    /**
     * {@link `glossary["Neighbors"]`}
     * The two players, whether dead or alive, sitting one seat clockwise and counterclockwise from the player in question.
     */
    static getNeighbors(seating: Seating, player: IPlayer): [IPlayer, IPlayer] {
        const seatNumber = player.seatNumber;

        if (seatNumber === undefined) {
            throw new PlayerNotSat(player);
        }

        const neighborSeats = this.getNeighboringSeats(seating, seatNumber);
        const neighbors = neighborSeats.map((seat) => seat.player);
        if (neighbors.includes(undefined)) {
            throw new PlayerNoNeighbors(
                player,
                neighbors as [IPlayer | undefined, IPlayer | undefined],
                seating
            );
        } else {
            return neighbors as [IPlayer, IPlayer];
        }
    }

    static *getNeighborPairs(seating: ISeating): Iterable<[IPlayer, IPlayer]> {
        for (const seats of this.getNeighboringSeatPairs(seating)) {
            const neighbors = seats.map((seat) => seat.player);

            let i = 0;
            if (neighbors[i] === undefined || neighbors[++i] === undefined) {
                throw new UnexpectedEmptySeat(seating, seating.getSeat(i));
            } else {
                yield neighbors as [IPlayer, IPlayer];
            }
        }
    }

    /**
     * {@link `glossary["Alive neighbours"]`}
     * The two alive players that are sitting closest—one clockwise, one counterclockwise—to the player in question, not including any dead players sitting between them.
     */
    static async getAliveNeighbors(
        seating: ISeating,
        player: IPlayer,
        isPlayerAlive?: AnyPredicate<IPlayer>
    ): Promise<[IPlayer, IPlayer]> {
        const seatNumber = player.seatNumber;

        if (seatNumber === undefined) {
            throw new PlayerNotSat(player);
        }

        const aliveNeighborSeatClockwise = await this.find(
            seating,
            this.getSafeIndex(seating, seatNumber + 1),
            Direction.Clockwise,
            (seat) => this.isSeatPlayerAlive(seating, seat, isPlayerAlive)
        );
        const aliveNeighborSeatCounterclockwise = await this.find(
            seating,
            this.getSafeIndex(seating, seatNumber - 1),
            Direction.Counterclockwise,
            (seat) => this.isSeatPlayerAlive(seating, seat, isPlayerAlive)
        );

        const neighbors = [
            aliveNeighborSeatClockwise?.player,
            aliveNeighborSeatCounterclockwise?.player,
        ] as [IPlayer | undefined, IPlayer | undefined];
        if (neighbors.includes(undefined)) {
            throw new PlayerNoAliveNeighbors(player, neighbors, seating);
        } else {
            return neighbors as [IPlayer, IPlayer];
        }
    }

    static async find(
        seating: ISeating,
        startSeatNumber: number,
        direction: Direction,
        condition: AnyPredicate<ISeat> = TAUTOLOGY
    ): Promise<ISeat | undefined> {
        for (const seat of seating.iterate(startSeatNumber, direction)) {
            if (await condition(seat)) {
                return seat;
            }
        }
    }

    /**
     * Get the nearest seat satisfying a condition around a seat position and the distance.
     * @param seatPosition Seat position to start search at.
     * @param condition A condition that needs to be satisfied for a seat to be considered qualified.
     * @returns A seat satisfying the condition and its distance from start seat position. Neighboring seats have a distance of 1.
     */
    static async findNearest(
        seating: Seating,
        seatNumber: number,
        condition: AnyPredicate<ISeat> = TAUTOLOGY
    ): Promise<{ seat: ISeat; distance: number } | undefined> {
        const clockwiseIterator = seating.iterate(
            this.getSafeIndex(seating, seatNumber + 1),
            Direction.Clockwise
        );
        const counterclockwiseIterator = seating.iterate(
            this.getSafeIndex(seating, seatNumber - 1),
            Direction.Counterclockwise
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
                // stop because two iterators meet
                return undefined;
            }

            clockwiseDistance++;
            if (await condition(clockwiseSeat)) {
                return { seat: clockwiseSeat, distance: clockwiseDistance };
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
            if (await condition(counterclockwiseSeat)) {
                return {
                    seat: counterclockwiseSeat,
                    distance: counterclockwiseDistance,
                };
            }
        }
    }

    /**
     * Exchange the players sitting at specified seating positions. Either/both seat can be empty.
     * @param seating A seating.
     * @param seatPosition The position of one seat
     * @param otherSeatPosition The position of the other seat
     * @returns The sitting results when players exchange the seat. Can have length 0, 1, or 2.
     */
    static async exchange(
        seating: ISeating,
        seatPosition: number,
        otherSeatPosition: number
    ): Promise<Array<SitResult>> {
        const seat = seating.getSeat(seatPosition);
        const otherSeat = seating.getSeat(otherSeatPosition);

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

    /**
     * Try to increase number of seats to accommodate all the players when necessary.
     * @param seating A seating.
     * @param numPlayers Number of players should fit.
     * @returns Whether the number of seats can fit all players.
     */
    static async fit(seating: ISeating, numPlayers: number): Promise<boolean> {
        if (numPlayers <= seating.numSeats) {
            return true;
        }

        if (
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
                this.formatPromptForSeatIncrease(numPlayers)
            )
        ) {
            await seating.setNumSeats(numPlayers);
            return true;
        }

        return false;
    }

    protected static formatPromptForSeatIncrease(newNumSeats: number) {
        return `Increase number of seats to ${newNumSeats} to fit all players`;
    }

    protected static async isSeatPlayerAlive(
        seating: ISeating,
        seat: ISeat,
        isPlayerAlive: AnyPredicate<IPlayer> = (player) => player.alive
    ): Promise<boolean> {
        const player = seat.player;
        if (player === undefined) {
            throw new UnexpectedEmptySeat(seating, seat);
        } else {
            return await isPlayerAlive(player);
        }
    }

    protected static validateNumSeats(seating: ISeating, numSeats: number) {
        if (numSeats <= 0) {
            throw new NumberOfSeatNotPositive(seating, numSeats);
        }
    }

    get isAllOccupied(): boolean {
        return this.seats.every((seat) => seat.isOccupied);
    }

    get numSeats(): number {
        return this.seats.length;
    }

    protected readonly seats: Array<ISeat> = [];

    constructor(initialNumSeats: number = Seating.DEFAULT_INITIAL_NUM_SEATS) {
        this.addSeats(initialNumSeats);
    }

    [Symbol.iterator]() {
        return this.seats[Symbol.iterator]();
    }

    isOccupied(seatNumber: number): boolean {
        return this.seats[seatNumber].isOccupied;
    }

    getSeat(seatNumber: number): ISeat {
        if (seatNumber < 0 || seatNumber > this.numSeats) {
            throw new AccessInvalidSeatPosition(seatNumber, this);
        }

        return this.seats[seatNumber];
    }

    addSeat(): ISeat {
        const newSeat = new Seat(this.numSeats);
        this.seats.push(newSeat);
        return newSeat;
    }

    async setNumSeats(numSeatsToAdd: number) {
        Seating.validateNumSeats(this, numSeatsToAdd);

        const numSeats = this.numSeats;
        if (numSeatsToAdd < numSeats) {
            const _removedPlayers = await Generator.promiseAll(
                Generator.toPromise(
                    (seat) => seat.remove(),
                    Generator.slice(this.seats, numSeatsToAdd, numSeats)
                )
            );
            this.seats.length = numSeatsToAdd;
        } else if (numSeatsToAdd > numSeats) {
            this.addSeats(numSeatsToAdd);
        }
    }

    trySit(player: IPlayer, seatNumber: number): SitResult {
        const seat = this.getSeat(seatNumber);
        return seat.trySit(player);
    }

    async sit(player: IPlayer, seatNumber: number): Promise<SitResult> {
        const seat = this.getSeat(seatNumber);

        if (player.seatNumber === seatNumber) {
            // short circuit when player is already at desired seat
            return { player, hasSat: true, seat };
        }

        // make the player unassigned
        await this.remove(player);

        return await seat.sit(player);
    }

    async remove(player: IPlayer): Promise<boolean> {
        if (player.seatNumber === undefined) {
            return false;
        }

        const seat = this.getSeat(player.seatNumber);
        const removed = await seat.remove();
        return removed !== undefined;
    }

    iterate(
        startSeatNumber: number,
        direction: Direction
    ): IterableIterator<ISeat> {
        const iterateMethod =
            direction === Direction.Clockwise ? clockwise : counterclockwise;
        return iterateMethod(this.seats, startSeatNumber);
    }

    protected addSeats(numSeatsToAdd: number): Array<ISeat> {
        const newSeats = [];

        for (let i = 0; i < numSeatsToAdd; i++) {
            newSeats.push(this.addSeat());
        }

        return newSeats;
    }

    toString(): string {
        return iterableToString(this.seats, 'Seating');
    }
}
