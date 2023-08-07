import type { ActorRoleType } from '../roles/actor-role-type';

export interface IGameSessionGuestCallbacks {
    readonly actorRoleType: ActorRoleType.GameSessionGuest;
}
