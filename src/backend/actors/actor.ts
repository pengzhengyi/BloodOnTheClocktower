import type { IActionHandler } from './actions/action-handler';
import type { IActorInfo } from './roles/actor-info';
import type { IActorRoles } from './roles/actor-roles';

/**
 * Actor represents roles that are eligible to perform activities.
 *
 * They are the initiators of various activities like user-based interactions.
 *
 * A key difference between actor and game participant is that the former is a role that is eligible to initiate activities, while the latter is a role engaging in game activities.
 */
export interface IActor extends IActionHandler {
    readonly info: IActorInfo;

    readonly roles: IActorRoles;
}
