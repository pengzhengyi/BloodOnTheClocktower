import { type RecoverableGameError } from '~/game/exception/exception';

export interface IStorytellerHandle {
    /**
     * Handle a recoverable Game Error. A game error is recoverable if
     * through it is resolvable from confirmation or correction.
     */
    storytellerHandle(
        exception: RecoverableGameError,
        timeout?: number
    ): Promise<boolean>;
}
