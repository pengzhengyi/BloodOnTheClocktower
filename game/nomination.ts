import 'reflect-metadata';
import { Expose, Exclude, instanceToPlain, Type } from 'class-transformer';
import { Vote } from './vote';
import { Player } from './player';

export enum NominationState {
    NotStarted,
    Ready,
    Voted,
}

@Exclude()
export class Nomination {
    static async init(nominator: Player, nominated: Player) {
        const nomination = new this(nominator, nominated);
        return await nomination;
    }

    @Expose({ toPlainOnly: true })
    @Type(() => Vote)
    vote?: Vote;

    @Expose({ toPlainOnly: true })
    @Type(() => Player)
    nominator: Player;

    @Expose({ toPlainOnly: true })
    @Type(() => Player)
    nominated: Player;

    get state(): NominationState {
        if (this.vote === undefined) {
            return NominationState.NotStarted;
        }

        if (this.vote.voted) {
            return NominationState.Voted;
        } else {
            return NominationState.Ready;
        }
    }

    protected constructor(nominator: Player, nominated: Player) {
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

    toJSON() {
        return instanceToPlain(this);
    }

    protected createVote(): Vote {
        return new Vote(this.nominated);
    }
}
