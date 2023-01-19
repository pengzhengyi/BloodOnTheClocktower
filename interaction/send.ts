import type { Player } from '~/game/player';

export interface ISend {
    /**
     * Send a player some data.
     */
    send<T>(
        player: Player,
        data: T,
        reason?: string,
        timeout?: number
    ): Promise<void>;
}
