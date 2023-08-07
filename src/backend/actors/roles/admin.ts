import type { CanAdminLogout } from '../actions/admin-logout/can-admin-logout';
import type { IActorRole } from './actor-role';
import type { ActorRoleType } from './actor-role-type';

export interface IAdmin extends IActorRole, CanAdminLogout {
    readonly type: ActorRoleType.Admin;
}
