import type { IStorytellerHandleOptions } from './options/interaction-options';

export interface IStorytellerHandle {
    /**
     * Handle a recoverable Game Error. A game error is recoverable if
     * through it is resolvable from confirmation or correction.
     */
    storytellerHandle<TError extends Error>(
        exception: TError,
        options?: IStorytellerHandleOptions
    ): Promise<boolean>;
}
