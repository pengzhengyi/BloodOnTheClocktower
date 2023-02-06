import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class DeadPlayerCannotNominate extends RecoverableGameError {
    static description = 'Dead player cannot nominate';

    forceAllowNomination = false;

    constructor(readonly player: IPlayer) {
        super(DeadPlayerCannotNominate.description);
    }
}
