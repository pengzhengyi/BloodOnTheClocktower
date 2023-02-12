import type { IChannel } from '../../../communication/channel';
import type { IStorytellerConfirmOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';

export interface IStorytellerConfirmChannel<TOptions = RequestInit>
    extends IInteractionChannel<
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
