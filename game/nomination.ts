import { Vote } from './vote';
import { Player } from './player';

export enum NominationState {
    NotStarted,
    Ready,
    Started,
}

export class Nomination {
    static async init(nominator: Player, nominated: Player) {
        const nomination = new this(nominator, nominated);
        return await nomination;
    }

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

    protected constructor(public nominator: Player, public nominated: Player) {
        this.nominator = nominator;
        this.nominated = nominated;
    }

    isVoteNotStarted(): this is { vote: undefined } {
        return this.state === NominationState.NotStarted;
    }

    isVoteStarted(): this is { vote: Vote } {
        return this.state !== NominationState.NotStarted;
    }

    startVote(players: Iterable<Player>) {
        const vote: Vote = this.isVoteStarted()
            ? this.vote
            : (this.vote = this.createVote());
        return vote.collectVotes(players);
    }

    protected createVote(): Vote {
        return new Vote(this.nominated);
    }
}
