import { CharacterType } from './charactertype';
import {
    CannotDetermineCharacterType,
    IncompleteCharacterRoleData,
    NoCharacterMatchingId,
} from './exception';
import { RoleDataKeyName, RoleData, ScriptCharacter } from './types';

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

    static load(id: string): Character {
        // TODO load asynchronously

        throw new NoCharacterMatchingId(id);
    }

    constructor(roleData: Partial<RoleData>) {
        this.checkForRequiredKeyNames(roleData);

        Object.assign(this, roleData);

        const characterType = CharacterType.of(this);
        if (characterType === undefined) {
            throw new CannotDetermineCharacterType(this);
        }
        this.characterType = characterType;
    }

    save(): ScriptCharacter {
        return { [RoleDataKeyName.ID]: this[RoleDataKeyName.ID]! };
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
