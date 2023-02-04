import { type RecoverableGameError } from '~/game/exception';

export interface IHandle {
    /**
     * Handle a recoverable Game Error. A game error is recoverable if
     * through it is resolvable from confirmation or correction.
     */
    handle(exception: RecoverableGameError, timeout?: number): Promise<boolean>;
}
