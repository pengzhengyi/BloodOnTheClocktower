import type { IPlayer } from '~/game/player';

export interface IConfirm {
    /**
     * Ask a player for confirmation.
     */
    confirm(
        player: IPlayer,
        prompt: string,
        timeout?: number
    ): Promise<boolean>;
}
