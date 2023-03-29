import type { IPlayer } from '../player/player';
import type { ISeating } from '../seating/seating';
import { RecoverableGameError } from './exception';

export class PlayerNoNeighbors extends RecoverableGameError {
    static description =
        'Cannot get two players that sitting nearest to the player';

    constructor(
        readonly player: IPlayer,
        readonly neighbors: [IPlayer | undefined, IPlayer | undefined],
        readonly seating: ISeating
    ) {
        super(PlayerNoNeighbors.description);
    }
}
