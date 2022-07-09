import { RecoverableGameError } from '~/game/exception';
import { Player } from '~/game/player';

export abstract class GameUI {
    static hasRaisedHandForVote(player: Player): boolean {
        // TODO
        throw new Error('Method not implemented.', player);
    }

    static handle(exception: RecoverableGameError) {
        // TODO
        throw new Error('Method not implemented.', exception);
    }
}
