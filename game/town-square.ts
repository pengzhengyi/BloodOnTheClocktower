import { IClocktower, Clocktower } from './clocktower';
import type { IPlayer } from './player';
import { Players, PlayersModification } from './players';
import type { ISeat } from './seating/seat';
import { ISeatAssignment, SeatAssignment } from './seating/seat-assignment';
import { SeatAssignmentMode } from './seating/seat-assignment-mode';
import { Seating } from './seating/seating';

export interface ResitResult {
    oldSeating: Seating;
    newSeating: Seating;
}

/**
 * {@link `glossary["Town Square"]`}
 * The grey cardboard sheet in the center of the seats. The Town Square has the player's life tokens and vote tokens on it, and the Traveller sheet under it.
 */
export class TownSquare {
    static async init(numPlayers: number) {
        const seating = await Seating.init(numPlayers);
        const players = new Players([]);
        return new this(seating, players);
    }

    static async from(
        players: Array<IPlayer>,
        seatAssignmentMode: SeatAssignmentMode = SeatAssignmentMode.NaturalInsert
    ) {
        const _players = new Players(players);
        const seating = await Seating.from(players, seatAssignmentMode);
        return new this(seating, _players);
    }

    readonly clockTower: IClocktower = new Clocktower();

    protected seating: Seating;

    protected players: Players;

    get seatAssignment(): ISeatAssignment {
        return new SeatAssignment(this.seating, this.players);
    }

    constructor(seating: Seating, players: Players) {
        this.seating = seating;
        this.players = players;
    }

    getPlayerOnSeat(position: number): IPlayer | undefined {
        return this.seating.getPlayerOnSeat(position);
    }

    async resit(
        modification: PlayersModification,
        seatAssignmentMode: SeatAssignmentMode = SeatAssignmentMode.NaturalInsert
    ): Promise<ResitResult> {
        const resitResult: Partial<ResitResult> = {
            oldSeating: this.seating,
        };
        this.players.modify(modification);
        const seating = await Seating.from(this.players, seatAssignmentMode);
        this.seating = resitResult.newSeating = seating;
        return resitResult as ResitResult;
    }

    /**
     * These are four scenarios when trying to sit a player to a seat, depending on whether the player is already assigned a seat and whether the seat is already occupied.
     *
     * - Assigned Player and Occupied Seat
     * - Assigned Player and Unoccupied Seat
     * - Unassigned Player and Occupied Seat
     * - Unassigned Player and Unoccupied Seat
     *
     * @param player A player
     * @param seat A Seat
     * @param force Whether the player will sit on given seat no matter existing seat assignment. Default to false.
     * @returns Whether the player manages to sit on the given seat.
     */
    async sit(player: IPlayer, seat: ISeat, force = false): Promise<boolean> {
        const playerSeatNumber = player.seatNumber;
        if (playerSeatNumber === seat.position) {
            // seat is occupied by requested player
            return true;
        }

        if (playerSeatNumber !== undefined) {
            // player is assigned to a seat
            if (force) {
                return false;
            }

            await this.seating.getSeat(playerSeatNumber).remove();
        }
        // player is unassigned now

        if (seat.isOccupied) {
            // seat is occupied by a player
            if (force) {
                return false;
            }

            await seat.remove();
        }
        // seat is unoccupied now

        const sitResult = seat.trySit(player);
        return sitResult.hasSat;
    }
}
