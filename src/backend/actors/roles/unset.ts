import type { CanAdminLogin } from '../actions/admin-login/can-admin-login';
import type { IActorRole } from './actor-role';
import type { ActorRoleType } from './actor-role-type';

export interface IUnset extends IActorRole, CanAdminLogin {
    readonly type: ActorRoleType.Unset;
}
