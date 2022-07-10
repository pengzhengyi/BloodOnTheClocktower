import { ExileNonTraveller, NoVoteInExile } from './exception';
import { Nomination, NominationState } from './nomination';
import { Player } from './player';
import { Vote } from './vote';

export type ExileState = NominationState;

export class Exile extends Nomination {
    constructor(public nominator: Player, nominated: Player) {
        super(nominator, nominated);

        if (!nominated.isTraveller) {
            throw new ExileNonTraveller(nominator, nominated);
        }
    }

    protected createVote(): Vote {
        return new Vote(this.nominated, true);
    }

    getPlayerAboutToExile(numPlayer: number): Player | undefined {
        const hasEnoughVoteToExile = this.vote?.hasEnoughVoteToExile(numPlayer);
        if (hasEnoughVoteToExile === undefined) {
            throw new NoVoteInExile(this);
        }

        return hasEnoughVoteToExile ? this.nominated : undefined;
    }
}
