import { clockwise } from '../common';
import { type IPlayer } from '../player';
import type { TJSON, PlayerOrdering } from '../types';
import { UnsupportedOperationForVote } from '../exception/unsupported-operation-for-vote';

/**
 * When a player nominates another player, a Vote is created and is at the NotVoted state. When starting to collect votes, the Vote is at the Voting state. When the vote is tallied, the Vote is at the Voted state.
 *
 * Whenever the vote is invalidated, the Vote is at the Invalid state.
 * A vote can be invalidated for various reasons, for example, when players fail to vote due to network delay and the storyteller decide to abort the vote. A invalid vote will be ignored.
 */
enum VoteStateName {
    Invalid = 'Invalid',
    NotVoted = 'Not Voted',
    Voting = 'Vote in Progress',
    Voted = 'Vote Finished',
}

export interface IVote {
    readonly forExile: boolean;

    readonly votes: Array<IPlayer>;

    readonly nominated: IPlayer;

    readonly hasVoted: boolean;

    invalidate(reason?: string): void;

    /* vote collection */
    getVoteOrder(players: PlayerOrdering): IterableIterator<IPlayer>;

    collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer>;

    /* vote inspection */
    hasEnoughVote(threshold: number): boolean;

    /* utility methods */
    toJSON(): TJSON;
}

interface IVoteState {
    stateName: VoteStateName;

    /* vote collection */
    collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer>;

    /* vote inspection */
    hasEnoughVote(numAlivePlayer: number): boolean;

    getVotes(): Array<IPlayer>;

    /* utility methods */
    toJSON(): TJSON;
}

/**
 * {@link `glossary["Vote"]`}
 * Raising a hand when the Storyteller is counting the number of players in favor of an execution. Players may vote per day. A dead player may only vote once for the rest of the game. The votes are tallied clockwise, ending with the nominated player. The exile process, though similar, is not a vote. See Exile.
 */
export class Vote implements IVote {
    get votes(): IPlayer[] {
        return this.voteState.getVotes();
    }

    nominated: IPlayer;

    get hasVoted(): boolean {
        return this.voteState.stateName === VoteStateName.Voted;
    }

    protected voteState: IVoteState;

    constructor(nominated: IPlayer, readonly forExile = false) {
        this.nominated = nominated;
        this.voteState = new NotVoted(this);
    }

    getVoteOrder(players: PlayerOrdering): IterableIterator<IPlayer> {
        const nominated = this.nominated;
        const nominatedIndex = players.indexOf(nominated);
        // array out of bound handled by clockwise
        return clockwise(players, nominatedIndex + 1);
    }

    hasEnoughVote(numAlivePlayer: number): boolean {
        return this.voteState.hasEnoughVote(numAlivePlayer);
    }

    collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer> {
        return this.voteState.collectVotes(players);
    }

    invalidate(reason?: string): void {
        this.transition(new InvalidVote(this, reason));
    }

    toJSON(): TJSON {
        return Object.assign(
            {
                nominated: this.nominated.toJSON(),
                forExile: this.forExile,
            },
            this.voteState.toJSON()
        );
    }

    /* state pattern methods */
    transition(voteState: IVoteState) {
        this.voteState = voteState;
    }

    throw(additionalMessage: string): never {
        throw new UnsupportedOperationForVote(this, additionalMessage);
    }
}

abstract class BaseVoteState implements IVoteState {
    abstract stateName: VoteStateName;

    // eslint-disable-next-line no-useless-constructor
    constructor(protected readonly vote: Vote) {}

    abstract getVotes(): IPlayer[];

    abstract collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer>;

    /* vote statistics */
    abstract hasEnoughVote(threshold: number): boolean;

    toJSON(): TJSON {
        return {
            description: this.stateName,
        };
    }

    protected hasEnoughVoteToExecute(
        numVotes: number,
        numAlivePlayer: number
    ): boolean {
        return numVotes >= numAlivePlayer / 2;
    }

    protected votesToJSON(votes: IPlayer[]): TJSON {
        return votes.map((player) => player.toJSON());
    }
}

class InvalidVote extends BaseVoteState {
    stateName = VoteStateName.Invalid;

    constructor(vote: Vote, readonly reason?: string) {
        super(vote);
    }

    getVotes(): Array<IPlayer> {
        this.vote.throw('Invalid vote has no votes');
    }

    collectVotes(_players: PlayerOrdering): AsyncGenerator<IPlayer> {
        this.vote.throw('Cannot collect votes for invalid vote');
    }

    hasEnoughVote(_threshold: number): boolean {
        this.vote.throw('Cannot count votes for invalid vote');
    }
}

class NotVoted extends BaseVoteState {
    stateName = VoteStateName.NotVoted;

    getVotes(): Array<IPlayer> {
        this.vote.throw('Vote has not been collected');
    }

    collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer> {
        this.vote.transition(new Voting(this.vote));
        return this.vote.collectVotes(players);
    }

    hasEnoughVote(_threshold: number): boolean {
        this.vote.throw('Cannot count votes when vote not started');
    }
}

class Voted extends BaseVoteState {
    stateName = VoteStateName.Voted;

    constructor(vote: Vote, protected readonly votes: Array<IPlayer>) {
        super(vote);
    }

    getVotes(): IPlayer[] {
        return this.votes;
    }

    collectVotes(_players: PlayerOrdering): AsyncGenerator<IPlayer> {
        this.vote.throw('Vote has already been collected');
    }

    hasEnoughVote(numAlivePlayer: number): boolean {
        return this.hasEnoughVoteToExecute(this.votes.length, numAlivePlayer);
    }

    toJSON(): TJSON {
        return Object.assign(
            {
                votes: this.votesToJSON(this.votes),
            },
            super.toJSON()
        );
    }
}

class Voting extends BaseVoteState {
    stateName = VoteStateName.Voting;

    protected votes: Array<IPlayer> = [];

    getVotes(): IPlayer[] {
        return this.votes;
    }

    async *collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer> {
        for (const player of players) {
            if (await player.collectVote(this.vote.forExile)) {
                this.votes.push(player);
                yield player;
            }
        }

        this.vote.transition(new Voted(this.vote, this.votes));
    }

    hasEnoughVote(numAlivePlayer: number): boolean {
        return this.hasEnoughVoteToExecute(this.votes.length, numAlivePlayer);
    }

    toJSON(): TJSON {
        return Object.assign(
            {
                votes: this.votesToJSON(this.votes),
            },
            super.toJSON()
        );
    }
}
