import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class PlayerCannotExile extends RecoverableGameError {
    static description = 'Player is not eligible to exile';

    forceAllowExile = false;

    constructor(readonly player: IPlayer) {
        super(PlayerCannotExile.description);
    }
}
