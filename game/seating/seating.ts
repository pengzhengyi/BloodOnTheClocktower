import { Generator } from '../collections';
import { clockwise, counterclockwise } from '../common';
import type { IPlayer } from '../player';
import { AnyPredicate, Direction, TAUTOLOGY } from '../types';
import {
    AccessInvalidSeatPosition,
    NumberOfSeatNotPositive,
    PlayerNoAliveNeighbors,
    PlayerNoNeighbors,
    PlayerNotSat,
    UnexpectedEmptySeat,
} from '../exception';
import { ISeat, Seat, SitResult } from './seat';
import { InteractionEnvironment } from '~/interaction/environment';

interface SyncResult {
    occupiedSeatsMismatchUnassignedPlayer: Set<ISeat>;
    assignedPlayerMismatchUnoccupiedSeats: Set<IPlayer>;
}

export interface ISeating extends Iterable<ISeat> {
    readonly numSeats: number;
    readonly isAllOccupied: boolean;

    isOccupied(seatNumber: number): boolean;
    getSeat(seatNumber: number): ISeat;
    addSeat(): ISeat;
    setNumSeats(newNumSeats: number): Promise<void>;
    iterate(
        startSeatNumber: number,
        direction: Direction
    ): IterableIterator<ISeat>;
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
        const occupiedSeatsMismatchUnassignedPlayer = new Set<ISeat>();
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
}
