import { BlankGrimoire } from './exception';
import { Grimoire } from './grimoire';
import { Player } from './player';
import { Task } from './types';

/**
 * {@link `glossary["Storyteller"]`}
 * The person who runs the game. The Storyteller keeps the Grimoire, follows the rules of the game, and makes the final decision on what happens when a situation needs adjudication.
 */
export class StoryTeller {
    static DEFAULT_WAKE_REASON =
        'Player is awaken to act or receive information';

    protected _grimoire?: Grimoire;

    get grimoire(): Grimoire {
        if (this._grimoire === undefined) {
            throw new BlankGrimoire(this, this._grimoire);
        }

        return this.grimoire;
    }

    interact(player: Player, action: Task<Player>, reason?: string) {
        if (reason === undefined) {
            reason = action.toString();
        }

        action(player);
    }

    initializeGrimoire(players: Iterable<Player>) {
        this._grimoire = new Grimoire(players);
    }

    /**
     * {@link `glossary["Wake"]`}
     * A player opening their eyes at night. The Storyteller wakes a player by tapping twice on the knee or shoulder, and wakes all players by saying “eyes open, everybody” at dawn.
     */
    wake(
        player: Player,
        action: Task<Player>,
        reason: string = StoryTeller.DEFAULT_WAKE_REASON
    ) {
        player.isWake = true;

        this.interact(player, action, reason);

        player.isWake = false;
    }
}
