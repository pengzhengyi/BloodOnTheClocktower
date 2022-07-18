import { BlankGrimoire } from './exception';
import { Grimoire } from './grimoire';
import { Player } from './player';
import { AsyncTask } from './types';

/**
 * {@link `glossary["Storyteller"]`}
 * The person who runs the game. The Storyteller keeps the Grimoire, follows the rules of the game, and makes the final decision on what happens when a situation needs adjudication.
 */
export class StoryTeller {
    static DEFAULT_WAKE_REASON =
        'Player is awaken to act or receive information';

    protected grimoire?: Grimoire;

    async getGrimoire(): Promise<Grimoire> {
        await new BlankGrimoire(this).throwWhen(
            (error) => error.storyteller.grimoire === undefined
        );

        return this.grimoire!;
    }

    async interact(player: Player, action: AsyncTask<Player>, reason?: string) {
        if (reason === undefined) {
            reason = action.toString();
        }

        await action(player);
    }

    initializeGrimoire(players: Iterable<Player>) {
        this.grimoire = new Grimoire(players);
    }

    /**
     * {@link `glossary["Wake"]`}
     * A player opening their eyes at night. The Storyteller wakes a player by tapping twice on the knee or shoulder, and wakes all players by saying “eyes open, everybody” at dawn.
     */
    async wake(
        player: Player,
        action: AsyncTask<Player>,
        reason: string = StoryTeller.DEFAULT_WAKE_REASON
    ) {
        player.isWake = true;

        await this.interact(player, action, reason);

        player.isWake = false;
    }
}
