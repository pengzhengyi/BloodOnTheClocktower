import type { Nomination } from '../nomination';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class NominatorNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominator has already nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: Nomination,
        readonly pastNomination: Nomination,
        readonly nominator: IPlayer
    ) {
        super(NominatorNominatedBefore.description);
    }
}
