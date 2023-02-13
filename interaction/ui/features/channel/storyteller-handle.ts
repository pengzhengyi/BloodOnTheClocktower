import type { IStorytellerHandleOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';

export type IStorytellerHandleChannel<
    TError extends Error,
    TOptions = RequestInit
> = Required<
    Pick<
        IInteractionChannel<
            TError,
            boolean,
            IStorytellerHandleOptions,
            TOptions
        >,
        'communicate'
    >
>;
