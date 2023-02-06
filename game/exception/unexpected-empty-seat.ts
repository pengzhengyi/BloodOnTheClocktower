import type { IPlayer } from '../player';
import type { ISeat } from '../seating/seat';
import type { ISeating } from '../seating/seating';
import { RecoverableGameError } from './exception';

export class UnexpectedEmptySeat extends RecoverableGameError {
    static description = 'Encountered an empty seat unexpected';

    get satPlayer(): IPlayer | undefined {
        return this.emptySeat.player;
    }

    constructor(readonly seating: ISeating, readonly emptySeat: ISeat) {
        super(UnexpectedEmptySeat.description);
    }
}
