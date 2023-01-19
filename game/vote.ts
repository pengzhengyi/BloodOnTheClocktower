import { Expose, Exclude, instanceToPlain, Type } from 'class-transformer';
import { clockwise } from './common';
import { NoVotesWhenCountingVote } from './exception';
import { Player } from './player';
import { PlayerOrdering } from './types';
import { Environment } from '~/interaction/environment';

/**
 * {@link `glossary["Vote"]`}
 * Raising a hand when the Storyteller is counting the number of players in favor of an execution. Players may vote per day. A dead player may only vote once for the rest of the game. The votes are tallied clockwise, ending with the nominated player. The exile process, though similar, is not a vote. See Exile.
 */
@Exclude()
export class Vote {
    static RECOLLECT_VOTE_PROMPT =
        'votes has already been collected, should recollect?';

    @Expose({ toPlainOnly: true })
    @Type(() => Player)
    public readonly nominated: Player;

    @Expose({ toPlainOnly: true })
    public readonly forExile: boolean;

    @Expose({ toPlainOnly: true })
    @Type(() => Player)
    votes?: Array<Player>;

    get voted() {
        return this.hasVoted();
    }

    constructor(nominated: Player, forExile = false) {
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
        return this.hasEnoughVote(numAlivePlayer / 2);
    }

    hasEnoughVoteToExile(numPlayer: number): Promise<boolean> {
        return this.hasEnoughVote(numPlayer / 2);
    }

    getVoteOrder(players: PlayerOrdering): IterableIterator<Player> {
        const nominated = this.nominated;
        const nominatedIndex = players.indexOf(nominated);
        // array out of bound handled by clockwise
        return clockwise(players, nominatedIndex + 1);
    }

    toJSON() {
        return instanceToPlain(this);
    }

    async *collectVotes(players: Iterable<Player>) {
        if (this.hasVoted()) {
            const shouldVoteAgain =
                await Environment.current.gameUI.storytellerConfirm(
                    Vote.RECOLLECT_VOTE_PROMPT
                );
            if (!shouldVoteAgain) {
                yield* this.votes;
                return;
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
