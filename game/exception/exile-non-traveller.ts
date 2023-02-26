import type { Exile } from '../voting/exile';
import { RecoverableGameError } from './exception';

export class ExileNonTraveller extends RecoverableGameError {
    static description = 'Cannot exile an non-traveller';

    constructor(readonly exile: Exile) {
        super(ExileNonTraveller.description);
    }
}
