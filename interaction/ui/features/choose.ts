import type { IChooseOptions } from './options/interaction-options';
import type { IChooseFromOptions, IChosen } from './types';
import type { IPlayer } from '~/game/player';

export interface IPlayerChooseFrom<T> extends IChooseFromOptions<T> {
    player: IPlayer;
}

export interface IChoose {
    /**
     * Asks a player to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    choose<T>(
        chooseFrom: IPlayerChooseFrom<T>,
        options?: IChooseOptions
    ): Promise<IChosen<T>>;
}
