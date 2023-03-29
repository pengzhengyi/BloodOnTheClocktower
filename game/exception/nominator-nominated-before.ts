import type { INomination } from '../nomination';
import type { IPlayer } from '../player/player';
import { RecoverableGameError } from './exception';

export class NominatorNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominator has already nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: INomination,
        readonly pastNomination: INomination,
        readonly nominator: IPlayer
    ) {
        super(NominatorNominatedBefore.description);
    }
}
