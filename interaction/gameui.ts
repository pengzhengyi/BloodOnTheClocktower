/* eslint-disable @typescript-eslint/no-unused-vars */
import { RecoverableGameError } from '~/game/exception';
import { Player } from '~/game/player';

export abstract class GameUI {
    static hasRaisedHandForVote(player: Player): boolean {
        // TODO
        throw new Error('Method not implemented.');
    }

    static handle(exception: RecoverableGameError) {
        // TODO
        throw new Error('Method not implemented.');
    }

    static choose<T>(player: Player, options: Iterable<T>): T {
        // TODO
        throw new Error('Method not implemented.');
    }

    static storytellerChoose<T>(options: Iterable<T>, reason?: string): T {
        // TODO
        throw new Error('Method not implemented.');
    }
}
