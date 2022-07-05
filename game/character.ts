import { CharacterType } from './charactertype';
import {
    CannotDetermineCharacterType,
    IncompleteCharacterRoleData,
} from './exception';
import { RoleDataKeyName, RoleData } from './types';

export interface Character extends Partial<RoleData> {}

/**
 * {@link `glossory["Character"]`}
 * The role that a player plays, such as the Butler, as listed on the character sheet and character almanac for the chosen edition. Characters may be in play or not in play.
 */
// eslint-disable-next-line no-redeclare
export abstract class Character {
    static REQUIRED_KEYNAMES = [
        RoleDataKeyName.NAME,
        RoleDataKeyName.TEAM,
        RoleDataKeyName.ABILITY,
    ];

    readonly characterType: CharacterType;

    constructor(roleData: Partial<RoleData>) {
        this.checkForRequiredKeyNames(roleData);

        Object.assign(this, roleData);

        const characterType = CharacterType.of(this);
        if (characterType === undefined) {
            throw new CannotDetermineCharacterType(this);
        }
        this.characterType = characterType;
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
