import type { INomination } from '../nomination';
import type { IPlayer } from '../player/player';
import { RecoverableGameError } from './exception';

export class NominatedNominatedBefore extends RecoverableGameError {
    static description =
        'Nomination failed because the nominated player has already been nominated in past nominations';

    forceAllowNomination = false;

    constructor(
        readonly failedNomination: INomination,
        readonly pastNomination: INomination,
        readonly nominated: IPlayer
    ) {
        super(NominatedNominatedBefore.description);
    }
}
