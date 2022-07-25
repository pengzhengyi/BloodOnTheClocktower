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

    static choose<T>(
        _player: Player,
        _options: Iterable<T>,
        _n = 1,
        _reason?: string
    ): Promise<T> | Promise<T[]> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static storytellerChoose<T>(
        _options: Iterable<T>,
        _reason?: string,
        _allowNotChoose = false
    ): Promise<T> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static confirm(_player: Player, _prompt: string): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static storytellerConfirm(_prompt: string): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    static send<T>(_player: Player, _data: T, _reason?: string): Promise<void> {
        // TODO
        throw new Error('Method not implemented.');
    }
}
