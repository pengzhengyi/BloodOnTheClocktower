import { RecoverableGameError } from '~/game/exception';
import { Player } from '~/game/player';

/**
 * Abstraction for necessary interaction with players.
 *
 * Also can be viewed as a game server.
 *
 */
class GameUI {
    static readonly DEFAULT_TIMEOUT: number = 5000;

    /**
     * Check whether a player has raised a hand for voting.
     */
    hasRaisedHandForVote(
        _player: Player,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    /**
     * Handle a recoverable Game Error. A game error is recoverable if
     * through it is resolvable from confirmation or correction.
     */
    handle(
        _exception: RecoverableGameError,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    /**
     * Asks a player to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
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

    /**
     * Ask storyteller to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    storytellerChoose<T>(
        _options: Iterable<T>,
        _n = 1,
        _reason?: string,
        _allowNotChoose = false,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<T> | Promise<T[]> | Promise<undefined> {
        // TODO
        throw new Error('Method not implemented.');
    }

    /**
     * Ask storyteller to choose one from some options.
     */
    storytellerChooseOne<T>(
        options: Iterable<T>,
        reason?: string,
        timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<T> {
        return this.storytellerChoose(
            options,
            1,
            reason,
            false,
            timeout
        ) as Promise<T>;
    }

    /**
     * Ask a player for confirmation.
     */
    confirm(
        _player: Player,
        _prompt: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    /**
     * Ask storyteller for confirmation/.
     */
    storytellerConfirm(
        _prompt: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }

    /**
     * Send a player some data.
     */
    send<T>(
        _player: Player,
        _data: T,
        _reason?: string,
        _timeout = GameUI.DEFAULT_TIMEOUT
    ): Promise<void> {
        // TODO
        throw new Error('Method not implemented.');
    }
}

const GAME_UI = new GameUI();

export { GameUI, GAME_UI };
