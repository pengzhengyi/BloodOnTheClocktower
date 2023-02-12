import type { IPlayerChooseFrom } from '../choose';
import type { IChooseOptions } from '../options/interaction-options';
import type { IChosen } from '../types';
import type { IInteractionChannel } from './interaction-channel';

export type IChooseChannel<T, TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            IPlayerChooseFrom<T>,
            IChosen<T>,
            IChooseOptions,
            TOptions
        >,
        'communicate'
    >
>;
