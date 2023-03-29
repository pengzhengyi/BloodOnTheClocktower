import type { ISendOptions } from './options/interaction-options';
import type { IPlayer } from '~/game/player/player';

export interface IMessage<T> {
    recipient: IPlayer;
    content: T;
}

export interface ISend {
    /**
     * Send a player some data.
     */
    send<T>(message: IMessage<T>, options?: ISendOptions): Promise<void>;
}
