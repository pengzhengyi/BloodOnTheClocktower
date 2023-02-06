import type { Alignment } from '../alignment';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class PlayerHasUnclearAlignment extends RecoverableGameError {
    static description =
        'IPlayer does not have a clear alignment as alignment is neither specified nor inferrable';

    declare correctedAlignment: Alignment;

    constructor(
        readonly player: IPlayer,
        readonly specifiedAlignment?: Alignment
    ) {
        super(PlayerHasUnclearAlignment.description);
    }
}
