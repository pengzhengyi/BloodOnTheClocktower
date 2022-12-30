import type { DeadReason } from './deadreason';
import type { Player } from './player';

export class Death {
    readonly player: Player;
    readonly deadReason: DeadReason;

    constructor(player: Player, deadReason: DeadReason) {
        this.player = player;
        this.deadReason = deadReason;
    }
}
