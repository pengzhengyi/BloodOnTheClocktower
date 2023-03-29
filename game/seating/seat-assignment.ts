import { Generator } from '../collections';
import type { IPlayer } from '../player/player';
import type { ISeat, SitResult } from './seat';
import type { ISeating } from './seating';

export interface ISeatAssignment<
    TPlayers extends Iterable<IPlayer> = Array<IPlayer>
> {
    assign(seating: ISeating, players: TPlayers): AsyncGenerator<SitResult>;
}

export class SeatAssignment<
    TPlayers extends Iterable<IPlayer> = Array<IPlayer>
> {
    static async assignAll<TPlayers extends Iterable<IPlayer> = Array<IPlayer>>(
        seatAssignment: ISeatAssignment<TPlayers>,
        seating: ISeating,
        players: TPlayers
    ): Promise<Array<SitResult>> {
        const sitResults: Array<SitResult> = [];

        for await (const sitResult of seatAssignment.assign(seating, players)) {
            sitResults.push(sitResult);
        }

        return sitResults;
    }

    assign(seating: ISeating, players: TPlayers): AsyncGenerator<SitResult> {
        const seatsToAssign = this.getSeatsToAssign(seating, players);
        const playersToAssign = this.getPlayersToAssign(seating, players);
        return this.assignPlayersToSeats(
            seating,
            seatsToAssign,
            playersToAssign
        );
    }

    async *getSeatsToAssign(
        seating: ISeating,
        _players: Iterable<IPlayer>
    ): AsyncGenerator<ISeat> {
        for (const seat of seating) {
            yield seat;
        }
    }

    async *getPlayersToAssign(
        _seating: ISeating,
        players: Iterable<IPlayer>
    ): AsyncGenerator<IPlayer> {
        for (const player of players) {
            yield player;
        }
    }

    async *assignPlayersToSeats(
        seating: ISeating,
        seatsToAssign: AsyncGenerator<ISeat>,
        playersToAssign: AsyncGenerator<IPlayer>
    ): AsyncGenerator<SitResult> {
        let noMoreSeats = false;
        let nextSeatToAssign: ISeat;
        for await (const player of playersToAssign) {
            if (!noMoreSeats) {
                const { done, value } = await seatsToAssign.next();
                if (done === true) {
                    noMoreSeats = true;
                } else {
                    nextSeatToAssign = value;
                }
            }

            if (noMoreSeats) {
                // add new seat to accommodate
                nextSeatToAssign = seating.addSeat();
            }

            const sitResult = await seating.sit(
                player,
                nextSeatToAssign!.position
            );
            yield sitResult;
        }
    }
}

class SeatAssignmentDecorator<
    TPlayers extends Iterable<IPlayer> = Array<IPlayer>
> extends SeatAssignment<TPlayers> {
    protected seatAssignment: SeatAssignment<TPlayers>;

    constructor(seatAssignment: SeatAssignment<TPlayers>) {
        super();
        this.seatAssignment = seatAssignment;
    }

    getSeatsToAssign(
        seating: ISeating,
        players: Iterable<IPlayer>
    ): AsyncGenerator<ISeat> {
        return this.seatAssignment.getSeatsToAssign(seating, players);
    }

    getPlayersToAssign(
        seating: ISeating,
        players: Iterable<IPlayer>
    ): AsyncGenerator<IPlayer> {
        return this.seatAssignment.getPlayersToAssign(seating, players);
    }

    assignPlayersToSeats(
        seating: ISeating,
        seatsToAssign: AsyncGenerator<ISeat>,
        playersToAssign: AsyncGenerator<IPlayer>
    ): AsyncGenerator<SitResult> {
        return this.seatAssignment.assignPlayersToSeats(
            seating,
            seatsToAssign,
            playersToAssign
        );
    }
}

export class AssignEmptySeats<
    TPlayers extends Iterable<IPlayer> = Array<IPlayer>
> extends SeatAssignmentDecorator<TPlayers> {
    async *getSeatsToAssign(
        seating: ISeating,
        players: Iterable<IPlayer>
    ): AsyncGenerator<ISeat> {
        for await (const seat of super.getSeatsToAssign(seating, players)) {
            if (seat.isEmpty) {
                yield seat;
            }
        }
    }
}

export class AssignNotSatPlayers<
    TPlayers extends Iterable<IPlayer> = Array<IPlayer>
> extends SeatAssignmentDecorator<TPlayers> {
    async *getPlayersToAssign(
        seating: ISeating,
        players: Iterable<IPlayer>
    ): AsyncGenerator<IPlayer> {
        for await (const player of super.getPlayersToAssign(seating, players)) {
            if (player.seatNumber === undefined) {
                yield player;
            }
        }
    }
}

export class RandomAssign<
    TPlayers extends Iterable<IPlayer> = Array<IPlayer>
> extends SeatAssignmentDecorator<TPlayers> {
    async *getPlayersToAssign(
        seating: ISeating,
        players: Iterable<IPlayer>
    ): AsyncGenerator<IPlayer> {
        for (const shuffledPlayer of await Generator.shuffleAsync(
            super.getPlayersToAssign(seating, players)
        )) {
            yield shuffledPlayer;
        }
    }
}
