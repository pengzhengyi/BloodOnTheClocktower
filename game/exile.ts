import { ExileNonTraveller, NoVoteInExile } from './exception';
import { Nomination, NominationState } from './nomination';
import { Player } from './player';
import { Vote } from './vote';

export type ExileState = NominationState;

export class Exile extends Nomination {
    static async init(nominator: Player, nominated: Player) {
        const exile = new this(nominator, nominated);
        await exile.validate();
        return exile;
    }

    async validate() {
        await new ExileNonTraveller(this).throwWhen(
            (error) => !error.exile.nominated.isTraveller
        );
    }

    async getPlayerAboutToExile(
        numPlayer: number
    ): Promise<Player | undefined> {
        const hasEnoughVoteToExile = await this.vote?.hasEnoughVoteToExile(
            numPlayer
        );
        if (hasEnoughVoteToExile === undefined) {
            throw new NoVoteInExile(this);
        }

        return hasEnoughVoteToExile ? this.nominated : undefined;
    }

    protected createVote(): Vote {
        return new Vote(this.nominated, true);
    }
}
