import type { IStorytellerConfirmOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';

export type IStorytellerConfirmChannel<TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            string,
            boolean,
            IStorytellerConfirmOptions,
            TOptions
        >,
        'communicate'
    >
>;
