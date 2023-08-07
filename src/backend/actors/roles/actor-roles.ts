import type { IActorRole } from './actor-role';
import type { ActorRoleType } from './actor-role-type';
import type { IActorRoleModificationStatus } from './actor-type-modification-status';

export interface IActorRoles {
    getRoleByType(roleType: ActorRoleType): IActorRole | undefined;
    hasRoleType(roleType: ActorRoleType): boolean;

    addRole(role: IActorRole): Promise<IActorRoleModificationStatus>;
    removeRole(role: IActorRole): Promise<IActorRoleModificationStatus>;
}
