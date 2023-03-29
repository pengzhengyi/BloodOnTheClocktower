import type { DeadReason } from './dead-reason';
import type { IPlayer } from './player/player';

export class Death {
    readonly player: IPlayer;
    readonly deadReason: DeadReason;

    constructor(player: IPlayer, deadReason: DeadReason) {
        this.player = player;
        this.deadReason = deadReason;
    }

    isFor(player: IPlayer): boolean {
        return this.player.equals(player);
    }
}
