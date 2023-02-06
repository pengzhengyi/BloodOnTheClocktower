import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class InvalidPlayerToSit extends RecoverableGameError {
    static description = 'Try to sit an invalid player';

    declare correctedPlayer: IPlayer;

    constructor(readonly player: IPlayer) {
        super(InvalidPlayerToSit.description);
    }
}
