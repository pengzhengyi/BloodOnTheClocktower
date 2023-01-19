import type { Player } from '~/game/player';

export interface IConfirm {
    /**
     * Ask a player for confirmation.
     */
    confirm(player: Player, prompt: string, timeout?: number): Promise<boolean>;
}
