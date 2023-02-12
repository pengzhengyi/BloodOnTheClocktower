import type { IChooseOptions } from './options/interaction-options';
import type { IPlayer } from '~/game/player';

export interface IChooseFrom<T> {
    player: IPlayer;
    options: Iterable<T>;
    recommendation?: T | Iterable<T>;
}

export interface IChosen<T> {
    choices: Array<T>;
}

export interface IChoose {
    /**
     * Asks a player to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    choose<T>(
        chooseFrom: IChooseFrom<T>,
        options?: IChooseOptions
    ): Promise<IChosen<T>>;
}
