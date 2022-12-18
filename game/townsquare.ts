import { Clocktower } from './clocktower';
import { Player } from './player';
import { Players } from './players';
import { Seat } from './seat';
import { SeatAssignment, SeatAssignmentMode, Seating } from './seating';

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
        players: Array<Player>,
        seatAssignmentMode: SeatAssignmentMode = SeatAssignmentMode.NaturalInsert
    ) {
        const _players = new Players(players);
        const seating = await Seating.from(players, seatAssignmentMode);
        return new this(seating, _players);
    }

    readonly clockTower: Clocktower = new Clocktower();

    protected seating: Seating;

    protected players: Players;

    get seatAssignment(): SeatAssignment {
        return new SeatAssignment(this.seating, this.players);
    }

    protected constructor(seating: Seating, players: Players) {
        this.seating = seating;
        this.players = players;
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
    async sit(player: Player, seat: Seat, force = false): Promise<boolean> {
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

        const sitResult = await seat.trySit(player);
        return sitResult.hasSat;
    }
}
