import type { Player } from '~/game/player';

export interface IHasRaisedHandForVote {
    /**
     * Check whether a player has raised a hand for voting.
     */
    hasRaisedHandForVote(player: Player, timeout?: number): Promise<boolean>;
}
