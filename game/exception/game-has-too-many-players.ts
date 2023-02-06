import { RecoverableGameError } from './exception';

export class GameHasTooManyPlayers extends RecoverableGameError {
    static description = 'Game has too many players';

    constructor(
        readonly numPlayers: number,
        readonly recommendedMaximum: number
    ) {
        super(GameHasTooManyPlayers.description);
    }
}
