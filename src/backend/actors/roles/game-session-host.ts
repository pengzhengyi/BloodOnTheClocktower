import type { CanGameSessionLeave } from '../actions/game-session-leave/can-game-session-leave';
import type { IActorRole } from './actor-role';
import type { ActorRoleType } from './actor-role-type';

export interface IGameSessionHost extends IActorRole, CanGameSessionLeave {
    readonly type: ActorRoleType.GameSessionHost;
}
