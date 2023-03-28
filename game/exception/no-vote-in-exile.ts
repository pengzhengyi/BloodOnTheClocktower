import type { IExile } from '../voting/exile';
import { RecoverableGameError } from './exception';

export class NoVoteInExile extends RecoverableGameError {
    static description = 'Exile does not have a finished vote';

    forceAllowExile = false;

    constructor(readonly exile: IExile) {
        super(NoVoteInExile.description);
    }
}
