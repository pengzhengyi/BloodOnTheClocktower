import { IncompleteCharacterRoleData } from './exception';
import { RoleDataKeyName, RoleData } from './types';

export interface Character extends Partial<RoleData> {}

/**
 * {@link `glossory["Character"]`}
 * The role that a player plays, such as the Butler, as listed on the character sheet and character almanac for the chosen edition. Characters may be in play or not in play.
 */
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
