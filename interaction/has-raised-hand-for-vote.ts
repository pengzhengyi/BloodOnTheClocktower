import type { IPlayer } from '~/game/player';

export interface IHasRaisedHandForVote {
    /**
     * Check whether a player has raised a hand for voting.
     */
    hasRaisedHandForVote(player: IPlayer, timeout?: number): Promise<boolean>;
}
