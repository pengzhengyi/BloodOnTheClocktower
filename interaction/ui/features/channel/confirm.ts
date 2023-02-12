import type { IConfirmFrom } from '../confirm';
import type { IConfirmOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';

export type IConfirmChannel<TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<IConfirmFrom, boolean, IConfirmOptions, TOptions>,
        'communicate'
    >
>;
