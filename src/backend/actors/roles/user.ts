import type { CanGameSessionCreate } from '../actions/game-session-create/can-game-session-create';
import type { CanGameSessionJoin } from '../actions/game-session-join/can-game-session-join';
import type { CanElevate } from '../actions/elevation/can-elevate';
import type { CanUserLogout } from '../actions/user-logout/can-user-logout';
import type { IActorRole } from './actor-role';
import type { ActorRoleType } from './actor-role-type';

export interface IUser
    extends IActorRole,
        CanUserLogout,
        CanElevate,
        CanGameSessionJoin,
        CanGameSessionCreate {
    readonly type: ActorRoleType.User;
}
