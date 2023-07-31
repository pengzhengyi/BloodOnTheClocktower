import type { IActor } from './actor';
import type { ActorType } from './actor-type';

/**
 * Player represents a participant in a game session who is playing the game.
 */
export interface IPlayer extends IActor {
    readonly type: ActorType.Player;
}
