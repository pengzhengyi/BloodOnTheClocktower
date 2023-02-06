import type { EditionName } from '../edition';
import { RecoverableGameError } from './exception';

export class EditionNotSpecifiedMinimumNumberOfPlayers extends RecoverableGameError {
    static description =
        'Edition not specified minimum number of players required to play';

    declare correctedMinimumNumberOfPlayers: number;

    constructor(readonly edition: EditionName | string) {
        super(EditionNotSpecifiedMinimumNumberOfPlayers.description);
    }
}
