import type { ActorType } from './actor-type';

/**
 * Actor represents a participant in a game session.
 *
 * For example, player and storyteller are both types of actor.
 */
export interface IActor {
    readonly type: ActorType;
}
