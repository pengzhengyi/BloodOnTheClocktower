import type { Exile } from '../exile';
import { RecoverableGameError } from './exception';

export class NoVoteInExile extends RecoverableGameError {
    static description = 'Exile does not have a finished vote';

    forceAllowExile = false;

    constructor(readonly exile: Exile) {
        super(NoVoteInExile.description);
    }
}
