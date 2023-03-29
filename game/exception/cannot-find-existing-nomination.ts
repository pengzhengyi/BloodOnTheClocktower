import type { INomination } from '../nomination';
import type { Predicate } from '../types';
import { RecoverableGameError } from './exception';

export class CannotFindExistingNomination extends RecoverableGameError {
    static description =
        'Expect to find an existing nomination matching condition but failed';

    constructor(
        readonly predicate: Predicate<INomination>,
        readonly pastNominations: Array<INomination>
    ) {
        super(CannotFindExistingNomination.description);
    }
}
