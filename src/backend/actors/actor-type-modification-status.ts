import type { IStatus } from '../common/utils/status';
import type { IActor } from './actor';
import type { ActorRoleModificationType } from './actor-role-modification-type';

/**
 * The status of a modification to an actor's roles.
 */
export interface IActorRoleModificationStatus extends IStatus {
    readonly type: ActorRoleModificationType;

    /** The actor involved in the modification. */
    readonly actor?: IActor;
}
