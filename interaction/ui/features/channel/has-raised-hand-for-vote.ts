import type { IHasRaisedHandForVoteOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';
import type { IPlayer } from '~/game/player/player';

export type IHasRaisedHandForVoteChannel<TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            IPlayer,
            boolean,
            IHasRaisedHandForVoteOptions,
            TOptions
        >,
        'communicate'
    >
>;
