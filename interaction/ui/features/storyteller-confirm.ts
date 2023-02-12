import type { IStorytellerConfirmOptions } from './options/interaction-options';

export interface IStorytellerConfirm {
    /**
     * Ask storyteller for confirmation.
     */
    storytellerConfirm(
        prompt: string,
        options?: IStorytellerConfirmOptions
    ): Promise<boolean>;
}
