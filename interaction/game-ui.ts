import { injectable } from 'inversify';
import { RecoverableGameError } from '~/game/exception';
import { Player } from '~/game/player';

/**
 * Abstraction for necessary interaction with players.
 *
 * Also can be viewed as a game server.
 */
export interface IGameUI {
    /**
     * Check whether a player has raised a hand for voting.
     */
    hasRaisedHandForVote(player: Player, timeout?: number): Promise<boolean>;

    /**
     * Handle a recoverable Game Error. A game error is recoverable if
     * through it is resolvable from confirmation or correction.
     */
    handle(exception: RecoverableGameError, timeout?: number): Promise<boolean>;

    /**
     * Asks a player to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    choose<T>(
        player: Player,
        options: Iterable<T>,
        n?: number,
        reason?: string,
        timeout?: number
    ): Promise<T> | Promise<T[]>;

    /**
     * Ask storyteller to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    storytellerChoose<T>(
        options: Iterable<T>,
        n?: number,
        reason?: string,
        allowNotChoose?: boolean,
        recommendation?: T | Iterable<T>,
        timeout?: number
    ): Promise<T> | Promise<T[]> | Promise<undefined>;

    /**
     * Ask storyteller to choose one from some options.
     */
    storytellerChooseOne<T>(
        options: Iterable<T>,
        reason?: string,
        recommendation?: T,
        timeout?: number
    ): Promise<T>;

    /**
     * Ask storyteller to decide. The required response might be like deciding a night act oder for a character.
     */
    storytellerDecide<T>(
        reason?: string,
        allowNotChoose?: boolean,
        timeout?: number
    ): Promise<T> | Promise<undefined>;

    /**
     * Ask a player for confirmation.
     */
    confirm(player: Player, prompt: string, timeout?: number): Promise<boolean>;

    /**
     * Ask storyteller for confirmation.
     */
    storytellerConfirm(prompt: string, timeout?: number): Promise<boolean>;

    /**
     * Send a player some data.
     */
    send<T>(
        player: Player,
        data: T,
        reason?: string,
        timeout?: number
    ): Promise<void>;

    callForNomination(
        alivePlayers: Iterable<Player>,
        reason?: string,
        timeout?: number
    ): Promise<Player | undefined>;
}

/**
 * Abstraction for necessary interaction with players.
 *
 * Also can be viewed as a game server.
 *
 */
@injectable()
export class GameUI implements IGameUI {
    static readonly DEFAULT_TIMEOUT: number = 5000;

    hasRaisedHandForVote(
        _player: Player,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    handle(
        _exception: RecoverableGameError,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    choose<T>(
        _player: Player,
        _options: Iterable<T>,
        _n = 1,
        _reason?: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<T> | Promise<T[]> {
        // TODO
        throw new Error('Method not implemented.');
    }

    storytellerChoose<T>(
        _options: Iterable<T>,
        _n = 1,
        _reason?: string,
        _allowNotChoose = false,
        _recommendation?: T | Iterable<T>,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<T> | Promise<T[]> | Promise<undefined> {
        // TODO
        throw new Error('Method not implemented.');
    }

    storytellerChooseOne<T>(
        options: Iterable<T>,
        reason?: string,
        recommendation?: T,
        timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<T> {
        return this.storytellerChoose(
            options,
            1,
            reason,
            false,
            recommendation,
            timeout
        ) as Promise<T>;
    }

    storytellerDecide<T>(
        _reason?: string,
        _allowNotChoose = false,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<T> | Promise<undefined> {
        // TODO
        throw new Error('Method not implemented.');
    }

    confirm(
        _player: Player,
        _prompt: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    storytellerConfirm(
        _prompt: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    send<T>(
        _player: Player,
        _data: T,
        _reason?: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<void> {
        // TODO
        throw new Error('Method not implemented.');
    }

    callForNomination(
        _alivePlayers: Iterable<Player>,
        _reason?: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<Player | undefined> {
        // TODO
        throw new Error('Method not implemented.');
    }
}
