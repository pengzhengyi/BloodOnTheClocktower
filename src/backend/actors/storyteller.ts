import type { IActor } from './actor';
import type { ActorType } from './actor-type';

/**
 * Storyteller represents a participant in a game session who is responsible for running the game.
 */
export interface IStoryteller extends IActor {
    readonly type: ActorType.Storyteller;
}
