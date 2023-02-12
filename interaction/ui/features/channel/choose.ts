import type { IChooseFrom, IChosen } from '../choose';
import type { IChooseOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';

export type IChooseChannel<T, TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            IChooseFrom<T>,
            IChosen<T>,
            IChooseOptions,
            TOptions
        >,
        'communicate'
    >
>;
