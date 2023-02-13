import type { IStorytellerDecideOptions } from '../options/interaction-options';
import type { IDecideFrom, IDecided } from '../types';
import type { IInteractionChannel } from './interaction-channel';

export type IStorytellerDecideChannel<T, TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            IDecideFrom<T>,
            IDecided<T>,
            IStorytellerDecideOptions,
            TOptions
        >,
        'communicate'
    >
>;
