import type { IChannel } from './communication/channel';
import type { IInteractionOptions } from './interaction-options';

export interface IInteractionProvider<
    TIn,
    TOut,
    TInteractionOptions extends IInteractionOptions,
    TOptions = RequestInit
> {
    readonly url: string;

    send?(
        channel: IChannel<TIn, TOut, TOptions>,
        data: TIn,
        options?: TInteractionOptions
    ): void;

    communicate?(
        channel: IChannel<TIn, TOut, TOptions>,
        data: TIn,
        options?: TInteractionOptions
    ): Promise<TOut>;
}
