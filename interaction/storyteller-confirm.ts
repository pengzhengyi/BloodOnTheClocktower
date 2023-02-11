import type { IChannel } from './communication/channel';
import type { IInteractionProvider } from './interaction-provider';
import type { IInteractionOptions } from './interaction-options';

export interface IStorytellerConfirm {
    /**
     * Ask storyteller for confirmation.
     */
    storytellerConfirm(prompt: string, timeout?: number): Promise<boolean>;
}

export interface IStorytellerConfirmOptions extends IInteractionOptions {}

export interface IStorytellerConfirmInteraction<TOptions = RequestInit>
    extends IInteractionProvider<
        string,
        boolean,
        IStorytellerConfirmOptions,
        TOptions
    > {
    communicate(
        channel: IChannel<string, boolean, TOptions>,
        prompt: string,
        options?: IStorytellerConfirmOptions
    ): Promise<boolean>;
}
