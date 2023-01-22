import type { IPlayer } from '~/game/player';

export interface IChoose {
    /**
     * Asks a player to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    choose<T>(
        player: IPlayer,
        options: Iterable<T>,
        n?: number,
        reason?: string,
        timeout?: number
    ): Promise<T> | Promise<T[]>;
}
