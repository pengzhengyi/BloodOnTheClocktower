import type { Exile } from '../exile';
import { RecoverableGameError } from './exception';

export class ExileNonTraveller extends RecoverableGameError {
    static description = 'Cannot exile an non-traveller';

    constructor(readonly exile: Exile) {
        super(ExileNonTraveller.description);
    }
}
