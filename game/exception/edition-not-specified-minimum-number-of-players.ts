import type { EditionId } from '../edition/edition-id';
import { RecoverableGameError } from './exception';

export class EditionNotSpecifiedMinimumNumberOfPlayers extends RecoverableGameError {
    static description =
        'Edition not specified minimum number of players required to play';

    declare correctedMinimumNumberOfPlayers: number;

    constructor(readonly edition: EditionId) {
        super(EditionNotSpecifiedMinimumNumberOfPlayers.description);
    }
}
