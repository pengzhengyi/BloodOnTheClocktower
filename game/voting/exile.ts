import { ExileNonTraveller } from '../exception/exile-non-traveller';
import { NoVoteInExile } from '../exception/no-vote-in-exile';
import { Nomination, type NominationState } from '../nomination';
import type { IPlayer } from '../player';
import { Vote } from './vote';

export type ExileState = NominationState;

export class Exile extends Nomination {
    static async init(nominator: IPlayer, nominated: IPlayer) {
        const exile = new this(nominator, nominated);
        await exile.validate();
        return exile;
    }

    async validate() {
        await new ExileNonTraveller(this).throwWhenAsync(
            async (error) => !(await error.exile.nominated.isTraveller)
        );
    }

    async getPlayerAboutToExile(
        numPlayer: number
    ): Promise<IPlayer | undefined> {
        let hasEnoughVoteToExile = await this.vote?.hasEnoughVoteToExile(
            numPlayer
        );

        if (hasEnoughVoteToExile === undefined) {
            const error = new NoVoteInExile(this);
            await error.resolve();
            hasEnoughVoteToExile = error.forceAllowExile;
        }

        return hasEnoughVoteToExile ? this.nominated : undefined;
    }

    protected createVote(): Vote {
        return new Vote(this.nominated, true);
    }
}
