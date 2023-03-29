import type { IHasRaisedHandForVoteOptions } from './options/interaction-options';

import type { IPlayer } from '~/game/player/player';

export interface IHasRaisedHandForVote {
    /**
     * Check whether a player has raised a hand for voting.
     */
    hasRaisedHandForVote(
        player: IPlayer,
        options?: IHasRaisedHandForVoteOptions
    ): Promise<boolean>;
}
