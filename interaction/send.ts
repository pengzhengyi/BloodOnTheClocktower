import type { IPlayer } from '~/game/player';

export interface ISend {
    /**
     * Send a player some data.
     */
    send<T>(
        player: IPlayer,
        data: T,
        reason?: string,
        timeout?: number
    ): Promise<void>;
}
