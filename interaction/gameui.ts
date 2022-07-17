/* eslint-disable @typescript-eslint/no-unused-vars */
import { RecoverableGameError } from '~/game/exception';
import { Player } from '~/game/player';

export abstract class GameUI {
    static hasRaisedHandForVote(player: Player): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static handle(exception: RecoverableGameError): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static choose<T>(player: Player, options: Iterable<T>): Promise<T> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static storytellerChoose<T>(
        options: Iterable<T>,
        reason?: string
    ): Promise<T> {
        // TODO
        throw new Error('Method not implemented.');
    }
}
