import type { INomination } from '../nomination';
import { RecoverableGameError } from './exception';

export class NoVoteInNomination extends RecoverableGameError {
    static description = 'Nomination does not have a finished vote';

    constructor(readonly nomination: INomination) {
        super(NoVoteInNomination.description);
    }
}
