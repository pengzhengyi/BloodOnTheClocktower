import { promises as fs } from 'fs';
import path from 'path';
import { getBackendPath } from '../../../paths';
import { ActorRoleType } from '~/src/backend/actors/roles/actor-role-type';

describe('ActorRoleType', () => {
    it('should have enum values all present in the roles directory', async () => {
        const actorRoleTypes = Object.values(ActorRoleType);
        const actorRoleTypeFileNames = actorRoleTypes.map(
            (roleType) => roleType.replaceAll(' ', '-') + '.ts'
        );

        // for each folder in the actions directory, check if the folder name is a valid action type
        const rolesPath = path.join(getBackendPath(), 'actors', 'roles');
        const actionsDirContent = await fs.readdir(rolesPath);

        expect(actionsDirContent).toIncludeAllMembers(actorRoleTypeFileNames);
    });
});
