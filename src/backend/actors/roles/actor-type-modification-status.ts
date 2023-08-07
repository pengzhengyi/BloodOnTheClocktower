import type { WithStatus } from '../../common/interfaces/with-status';
import type { IActor } from '../actor';
import type { ActorRoleModificationType } from './actor-role-modification-type';

/**
 * The status of a modification to an actor's roles.
 */
export interface IActorRoleModificationStatus extends WithStatus {
    readonly type: ActorRoleModificationType;

    /** The actor involved in the modification. */
    readonly actor?: IActor;
}
