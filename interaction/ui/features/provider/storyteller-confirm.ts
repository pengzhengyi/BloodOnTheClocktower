import type { IChannel } from '../../../communication/channel';
import type { IStorytellerConfirmOptions } from '../options/interaction-options';
import type { IInteractionProvider } from './interaction-provider';

export interface IStorytellerConfirmProvider<TOptions = RequestInit>
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
