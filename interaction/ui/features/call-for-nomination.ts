import type { ICallForNominationOptions } from './options/interaction-options';

import type { IPlayer } from '~/game/player';

export interface ICallForNomination {
    callForNomination(
        alivePlayers: Iterable<IPlayer>,
        options?: ICallForNominationOptions
    ): Promise<IPlayer | undefined>;
}
