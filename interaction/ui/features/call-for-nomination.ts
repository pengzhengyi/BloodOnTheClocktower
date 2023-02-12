import type { ICallForNominationOptions } from './options/interaction-options';

import type { IPlayer } from '~/game/player';

export interface IProposedNomination {
    nominator: IPlayer;
    nominated: IPlayer;
}

export interface IProposedNominations {
    hasNominations: boolean;
    first?: IProposedNomination;
    /**
     * This is a list of nominations that were made during the grace period after first proposed nomination. Storyteller can use this information to account for network speed impact.
     */
    otherNominationsInGracePeriod?: Array<IProposedNomination>;
}

export interface ICallForNomination {
    callForNomination(
        alivePlayers: Array<IPlayer>,
        options?: ICallForNominationOptions
    ): Promise<IProposedNominations>;
}
