import type { IStorytellerChooseOneOptions } from '../options/interaction-options';
import type { IChooseFromOptions } from '../types';
import type { IInteractionChannel } from './interaction-channel';

export type IStorytellerChooseOneChannel<T, TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            IChooseFromOptions<T>,
            T,
            IStorytellerChooseOneOptions,
            TOptions
        >,
        'communicate'
    >
>;
