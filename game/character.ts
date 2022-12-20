import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './charactertype';
import { lowercaseLetters } from './common';
import {
    CannotDetermineCharacterType,
    IncompleteCharacterRoleData,
} from './exception';
import { RoleDataKeyName, RoleData, ScriptCharacter } from './types';

export interface Character extends Partial<RoleData> {}

/**
 * {@link `glossary["Character"]`}
 * The role that a player plays, such as the Butler, as listed on the character sheet and character almanac for the chosen edition. Characters may be in play or not in play.
 */
// eslint-disable-next-line no-redeclare
export abstract class Character {
    static REQUIRED_KEYNAMES = [
        RoleDataKeyName.NAME,
        RoleDataKeyName.TEAM,
        RoleDataKeyName.ABILITY,
    ];

    static characterType: typeof CharacterType;

    static roleData: Partial<RoleData>;

    static getCanonicalId(name: string) {
        return lowercaseLetters(name);
    }

    static get id() {
        const id = this.roleData[RoleDataKeyName.ID];
        if (id === undefined) {
            throw new IncompleteCharacterRoleData(
                this.roleData,
                RoleDataKeyName.ID
            );
        }
        return id;
    }

    static get isMinion() {
        return this.isCharacterType(Minion);
    }

    static get isDemon() {
        return this.isCharacterType(Demon);
    }

    static get isTownsfolk() {
        return this.isCharacterType(Townsfolk);
    }

    static get isOutsider() {
        return this.isCharacterType(Outsider);
    }

    static get isTraveller() {
        return this.isCharacterType(Traveller);
    }

    static get isFabled() {
        return this.isCharacterType(Fabled);
    }

    static initialize(roleData: Partial<RoleData>) {
        this.checkForRequiredKeyNames(roleData);
        this.roleData = roleData;
        this.setCharacterType(roleData);
    }

    static toJSON(): string {
        return this.id;
    }

    static toScriptCharacter(): ScriptCharacter {
        return { [RoleDataKeyName.ID]: this.toJSON() };
    }

    static isCharacterType(characterType: typeof CharacterType): boolean {
        return Object.is(this.characterType, characterType);
    }

    protected static setCharacterType(roleData: Partial<RoleData>) {
        const type = roleData[RoleDataKeyName.TEAM];

        const characterType = CharacterType.unsafeFrom(type);
        if (characterType === undefined) {
            throw new CannotDetermineCharacterType(this, type);
        } else {
            this.characterType = characterType;
        }
    }

    protected static checkForRequiredKeyNames(roleData: Partial<RoleData>) {
        for (const requiredKeyName of this.REQUIRED_KEYNAMES) {
            if (roleData[requiredKeyName] === undefined) {
                throw new IncompleteCharacterRoleData(
                    roleData,
                    requiredKeyName
                );
            }
        }
    }
}

/**
 * {@link `glossary["Character token"]`}
 * The large round token that each player gets at the start of the game that indicates their character. Players cannot look at each other's character tokens.
 */
export type CharacterToken = typeof Character;
export const CharacterToID = (character: CharacterToken) => character.id;
export const CharactersToIDs = (characters: Array<CharacterToken>) =>
    characters.map(CharacterToID);
