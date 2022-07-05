import { Grimoire } from './grimoire';
import { Player } from './player';
import { Action } from './types';

export class StoryTeller {
    protected grimoire?: Grimoire;

    interact(player: Player, action: Action<Player>, reason?: string) {
        if (reason === undefined) {
            reason = action.toString();
        }

        action(player);
    }

    initializeGrimoire(players: Iterable<Player>) {
        this.grimoire = new Grimoire(players);
    }
}
