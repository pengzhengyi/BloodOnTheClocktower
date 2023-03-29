import type { IPlayer } from '../player/player';
import { RecoverableGameError } from './exception';

export class PlayerCannotNominate extends RecoverableGameError {
    static description = 'Player is not eligible to nominate';

    forceAllowNomination = false;

    constructor(readonly player: IPlayer) {
        super(PlayerCannotNominate.description);
    }
}
