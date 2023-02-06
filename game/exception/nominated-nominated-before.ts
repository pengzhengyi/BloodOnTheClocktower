import type { Nomination } from '../nomination';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class NominatedNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominated player has already been nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: Nomination,
        readonly pastNomination: Nomination,
        readonly nominated: IPlayer
    ) {
        super(NominatedNominatedBefore.description);
    }
}
