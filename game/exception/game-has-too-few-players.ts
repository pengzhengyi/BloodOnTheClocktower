import { RecoverableGameError } from './exception';

export class GameHasTooFewPlayers extends RecoverableGameError {
    static description = 'Game has too few players';

    constructor(
        readonly numPlayers: number,
        readonly recommendedMinimum: number
    ) {
        super(GameHasTooFewPlayers.description);
    }
}
