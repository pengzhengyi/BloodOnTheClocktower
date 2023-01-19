import type { Player } from '~/game/player';

export interface ICallForNomination {
    callForNomination(
        alivePlayers: Iterable<Player>,
        reason?: string,
        timeout?: number
    ): Promise<Player | undefined>;
}
