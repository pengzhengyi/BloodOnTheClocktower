import type { Nomination } from '../nomination';
import { RecoverableGameError } from './exception';

export class NoVoteInNomination extends RecoverableGameError {
    static description = 'Nomination does not have a finished vote';

    constructor(readonly nomination: Nomination) {
        super(NoVoteInNomination.description);
    }
}
