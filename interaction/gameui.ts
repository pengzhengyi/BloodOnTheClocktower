import { RecoverableGameError } from '~/game/exception';
import { Player } from '~/game/player';

export abstract class GameUI {
    static hasRaisedHandForVote(_player: Player): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static handle(_exception: RecoverableGameError): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static choose<T>(_player: Player, _options: Iterable<T>): Promise<T> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static storytellerChoose<T>(
        _options: Iterable<T>,
        _reason?: string
    ): Promise<T> {
        // TODO
        throw new Error('Method not implemented.');
    }
}
