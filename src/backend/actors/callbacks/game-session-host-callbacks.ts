import type { ActorRoleType } from '../roles/actor-role-type';

export interface IGameSessionHostCallbacks {
    readonly actorRoleType: ActorRoleType.GameSessionHost;
}
