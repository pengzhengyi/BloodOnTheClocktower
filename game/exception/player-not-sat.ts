import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class PlayerNotSat extends RecoverableGameError {
    static description = 'Encountered a player without a seat unexpected';

    constructor(readonly player: IPlayer) {
        super(PlayerNotSat.description);
    }
}
