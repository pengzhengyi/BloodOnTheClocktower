import '@abraham/reflection';
import type { IVote } from './voting/vote';
import { Vote } from './voting/vote';
import type { IPlayer } from './player/player';
import type { TJSON } from './types';

export enum NominationState {
    NotStarted,
    Ready,
    Voted,
}

export interface INomination {
    /* essential properties */
    readonly vote: IVote;

    readonly nominator: IPlayer;
    readonly nominated: IPlayer;

    collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer>;

    /* utility methods */
    toJSON(): TJSON;
}

export class Nomination implements INomination {
    readonly vote: IVote;

    readonly nominator: IPlayer;

    readonly nominated: IPlayer;

    constructor(nominator: IPlayer, nominated: IPlayer) {
        this.nominator = nominator;
        this.nominated = nominated;
        this.vote = this.createVote();
    }

    collectVotes(players: Iterable<IPlayer>): AsyncGenerator<IPlayer> {
        return this.vote.collectVotes(players);
    }

    toJSON() {
        return {
            vote: this.vote.toJSON(),
            nominator: this.nominator.toJSON(),
            nominated: this.nominated.toJSON(),
        };
    }

    protected createVote(): IVote {
        return new Vote(this.nominated);
    }
}
