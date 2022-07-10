import { Player } from './player';
import { UnexpectedEmptySeat } from './exception';
import { Predicate } from './types';
import { GameUI } from '~/interaction/gameui';

export class Seat {
    player?: Player;

    constructor(public readonly position: number) {
        this.position = position;
    }

    get sat(): boolean {
        return this.isOccupied();
    }

    isOccupied(): this is { player: Player } {
        return !this.isEmpty();
    }

    isEmpty() {
        return this.player === undefined;
    }

    trySit(player: Player): this is { player: Player } {
        if (this.isOccupied()) {
            return false;
        } else {
            this.player = player;
            return true;
        }
    }

    sit(player: Player): Player | undefined {
        const playerOut = this.player;
        this.player = player;
        return playerOut;
    }
}

export const filterSeatWithAlivePlayer: Predicate<Seat> = (seat) => {
    if (seat.isOccupied()) {
        return seat.player.alive;
    } else {
        // require user manual intervention
        GameUI.handle(new UnexpectedEmptySeat(seat));

        return false;
    }
};
