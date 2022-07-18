import { clockwise } from './common';
import { NoVotesWhenCountingVote } from './exception';
import { Player } from './player';
import { PlayerOrdering } from './types';
import { Confirm } from '~/interaction/confirm';

/**
 * {@link `glossary["Vote"]`}
 * Raising a hand when the Storyteller is counting the number of players in favor of an execution. Players may vote per day. A dead player may only vote once for the rest of the game. The votes are tallied clockwise, ending with the nominated player. The exile process, though similar, is not a vote. See Exile.
 */
export class Vote {
    static RECOLLECT_VOTE_PROMPT =
        'votes has already been collected, should recollect?';

    votes?: Array<Player>;

    get voted() {
        return this.hasVoted();
    }

    constructor(
        public readonly nominated: Player,
        public readonly forExile: boolean = false
    ) {
        this.nominated = nominated;
        this.forExile = forExile;
    }

    hasVoted(): this is { votes: Array<Player> } {
        return this.votes !== undefined;
    }

    hasNotVoted(): this is { votes: undefined } {
        return this.votes === undefined;
    }

    async hasEnoughVote(threshold: number): Promise<boolean> {
        if (this.hasNotVoted()) {
            await new NoVotesWhenCountingVote(this).throwWhen((error) =>
                error.vote.hasNotVoted()
            );
        }

        return (this as { votes: Array<Player> }).votes.length >= threshold;
    }

    hasEnoughVoteToExecute(numAlivePlayer: number): Promise<boolean> {
        return this.hasEnoughVote(Math.floor(numAlivePlayer / 2));
    }

    hasEnoughVoteToExile(numPlayer: number): Promise<boolean> {
        return this.hasEnoughVote(Math.floor(numPlayer / 2));
    }

    getVoteOrder(players: PlayerOrdering): IterableIterator<Player> {
        const nominated = this.nominated;
        const nominatedIndex = players.indexOf(nominated);
        // array out of bound handled by clockwise
        return clockwise(players, nominatedIndex + 1);
    }

    async *collectVotes(players: Iterable<Player>) {
        if (this.hasVoted()) {
            const shouldVoteAgain = await new Confirm(
                Vote.RECOLLECT_VOTE_PROMPT
            ).getValue();
            if (!shouldVoteAgain) {
                yield* this.votes;
            }
        }

        this.votes = [];
        for (const player of players) {
            if (await player.collectVote(this.forExile)) {
                this.votes.push(player);
                yield player;
            }
        }
    }
}
