import type { IPlayer } from './player';
import { Player } from './player';

export interface IPlayerFactory {
    createPlayer(username: string, id?: string): Promise<IPlayer>;
}

export class PlayerFactory implements IPlayerFactory {
    createPlayer(username: string, id?: string | undefined): Promise<IPlayer> {
        return Player.init(username, undefined, undefined, id);
    }
}
