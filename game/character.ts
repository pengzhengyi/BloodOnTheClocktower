import { IncompleteCharacterRoleData } from './exception';
import { RoleDataKeyName, RoleData } from './types';

export interface Character extends Partial<RoleData> {}

// eslint-disable-next-line no-redeclare
export class Character {
    static REQUIRED_KEYNAMES = [
        RoleDataKeyName.NAME,
        RoleDataKeyName.TEAM,
        RoleDataKeyName.ABILITY,
    ];

    constructor(roleData: Partial<RoleData>) {
        this.checkForRequiredKeyNames(roleData);

        Object.assign(this, roleData);
    }

    private checkForRequiredKeyNames(roleData: Partial<RoleData>) {
        for (const requiredKeyName of Character.REQUIRED_KEYNAMES) {
            if (roleData[requiredKeyName] === undefined) {
                throw new IncompleteCharacterRoleData(
                    roleData,
                    requiredKeyName
                );
            }
        }
    }
}
