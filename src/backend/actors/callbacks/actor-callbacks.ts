import type { ActorRoleType } from '../roles/actor-role-type';

/**
 * Actor callbacks represents all the callbacks registered by an actor. These callbacks can be used to contact the actor.
 */
export interface IActorCallbacks {
    readonly actorId: string;
    readonly actorRoleType: ActorRoleType;
}
