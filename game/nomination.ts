import { Vote } from './vote';
import { Player } from './player';

export enum NominationState {
    NotStarted,
    Ready,
    Started,
}

export class Nomination {
    vote?: Vote;

    get state(): NominationState {
        if (this.vote === undefined) {
            return NominationState.NotStarted;
        }

        if (this.vote.voted) {
            return NominationState.Started;
        } else {
            return NominationState.Ready;
        }
    }

    constructor(public nominator: Player, public nominated: Player) {
        this.nominator = nominator;
        this.nominated = nominated;
    }

    hasVoteStarted(): this is { vote: Vote } {
        return this.state !== NominationState.NotStarted;
    }

    startVote(players: Iterable<Player>) {
        const vote: Vote = this.hasVoteStarted()
            ? this.vote
            : (this.vote = this.createVote());
        return vote.collectVotes(players);
    }

    protected createVote(): Vote {
        return new Vote(this.nominated);
    }
}
