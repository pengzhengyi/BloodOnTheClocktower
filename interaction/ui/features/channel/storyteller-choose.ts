import type { IStorytellerChooseOptions } from '../options/interaction-options';
import type { IChooseFromOptions, IChosen } from '../types';
import type { IInteractionChannel } from './interaction-channel';

export type IStorytellerChooseChannel<T, TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            IChooseFromOptions<T>,
            IChosen<T>,
            IStorytellerChooseOptions,
            TOptions
        >,
        'communicate'
    >
>;
