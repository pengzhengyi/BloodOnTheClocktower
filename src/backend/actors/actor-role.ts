import type { ActorRoleType } from './actor-role-type';

/**
 * Actor role represents a role an actor can assume. By assuming a role, an actor is eligible to perform certain activities.
 */
export interface IActorRole {
    readonly type: ActorRoleType;
}
