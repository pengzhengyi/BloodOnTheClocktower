import type { IPlayer } from '~/game/player';

export interface ICallForNomination {
    callForNomination(
        alivePlayers: Iterable<IPlayer>,
        reason?: string,
        timeout?: number
    ): Promise<IPlayer | undefined>;
}
