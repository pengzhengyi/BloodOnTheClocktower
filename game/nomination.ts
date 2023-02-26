import '@abraham/reflection';
import { Expose, Exclude, instanceToPlain, Type } from 'class-transformer';
import { Vote } from './voting/vote';
import type { IPlayer } from './player';

export enum NominationState {
    NotStarted,
    Ready,
    Voted,
}

@Exclude()
export class Nomination {
    static async init(nominator: IPlayer, nominated: IPlayer) {
        const nomination = new this(nominator, nominated);
        return await nomination;
    }

    @Expose({ toPlainOnly: true })
    @Type(() => Vote)
    vote?: Vote;

    @Expose({ toPlainOnly: true })
    nominator: IPlayer;

    @Expose({ toPlainOnly: true })
    nominated: IPlayer;

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

    protected constructor(nominator: IPlayer, nominated: IPlayer) {
        this.nominator = nominator;
        this.nominated = nominated;
    }

    isVoteNotStarted(): this is { vote: undefined } {
        return this.state === NominationState.NotStarted;
    }

    isVoteStarted(): this is { vote: Vote } {
        return this.state !== NominationState.NotStarted;
    }

    startVote(players: Iterable<IPlayer>) {
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
