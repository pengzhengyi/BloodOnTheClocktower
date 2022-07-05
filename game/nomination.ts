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

    startVote(players: Iterable<Player>): Iterable<Player> {
        if (this.state === NominationState.NotStarted) {
            this.vote = this.createVote();
        }

        return this.vote?.collectVotes(players)!;
    }

    protected createVote(): Vote {
        return new Vote(this.nominated);
    }
}
