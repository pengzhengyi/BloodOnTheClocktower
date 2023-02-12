import type { IConfirmOptions } from './options/interaction-options';
import type { IPlayer } from '~/game/player';

export interface IConfirmFrom {
    player: IPlayer;
    prompt: string;
}

export interface IConfirm {
    /**
     * Ask a player for confirmation.
     */
    confirm(
        confirmFrom: IConfirmFrom,
        options?: IConfirmOptions
    ): Promise<boolean>;
}
