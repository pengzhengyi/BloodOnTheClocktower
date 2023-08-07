import type { CanGameSessionCreate } from '../actions/game-session-create/can-game-session-create';
import type { CanElevate } from '../actions/elevation/can-elevate';
import type { CanGameSessionJoin } from '../actions/game-session-join/can-game-session-join';
import type { CanUserLogin } from '../actions/user-login/can-user-login';
import type { IActorRole } from './actor-role';
import type { ActorRoleType } from './actor-role-type';

export interface IAnonymousUser
    extends IActorRole,
        CanUserLogin,
        CanElevate,
        CanGameSessionJoin,
        CanGameSessionCreate {
    readonly type: ActorRoleType.AnonymousUser;
}
