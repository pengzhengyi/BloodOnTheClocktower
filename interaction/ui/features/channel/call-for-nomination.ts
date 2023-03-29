import type { IProposedNominations } from '../call-for-nomination';
import type { ICallForNominationOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';
import type { IPlayer } from '~/game/player/player';

export type ICallForNominationChannel<TOptions = RequestInit> = Required<
    Pick<
        IInteractionChannel<
            Array<IPlayer>,
            IProposedNominations,
            ICallForNominationOptions,
            TOptions
        >,
        'communicate'
    >
>;
