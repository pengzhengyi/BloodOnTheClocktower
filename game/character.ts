import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './character-type';
import { lowercaseLetters } from './common';
import {
    CannotDetermineCharacterType,
    IncompleteCharacterRoleData,
} from './exception';
import { RoleDataKeyName, type RoleData, type ScriptCharacter } from './types';

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

    static get readableName() {
        const name = this.roleData[RoleDataKeyName.NAME];
        if (name === undefined) {
            throw new IncompleteCharacterRoleData(
                this.roleData,
                RoleDataKeyName.NAME
            );
        }
        return name;
    }

    static get firstNightOrder(): number {
        const order = this.roleData[RoleDataKeyName.FIRSTNIGHT];
        if (order === undefined) {
            throw new IncompleteCharacterRoleData(
                this.roleData,
                RoleDataKeyName.FIRSTNIGHT
            );
        }
        return order;
    }

    static get otherNightOrder(): number {
        const order = this.roleData[RoleDataKeyName.OTHERNIGHT];
        if (order === undefined) {
            throw new IncompleteCharacterRoleData(
                this.roleData,
                RoleDataKeyName.OTHERNIGHT
            );
        }
        return order;
    }

    static get isMinion() {
        return this.is(Minion);
    }

    static get isDemon() {
        return this.is(Demon);
    }

    static get isTownsfolk() {
        return this.is(Townsfolk);
    }

    static get isOutsider() {
        return this.is(Outsider);
    }

    static get isTraveller() {
        return this.is(Traveller);
    }

    static get isFabled() {
        return this.is(Fabled);
    }

    static get isEvilCharacter() {
        return this.isDemon || this.isMinion;
    }

    static get isGoodCharacter() {
        return this.isTownsfolk || this.isOutsider;
    }

    static initialize(roleData: Partial<RoleData>) {
        this.checkForRequiredKeyNames(roleData);
        this.roleData = roleData;
        this.setCharacterType(roleData);
    }

    static toJSON(): string {
        return this.id;
    }

    static toString() {
        return `${this.readableName}`;
    }

    static toScriptCharacter(): ScriptCharacter {
        return { [RoleDataKeyName.ID]: this.toJSON() };
    }

    static is(characterType: typeof CharacterType): boolean {
        return this.characterType.is(characterType);
    }

    protected static setCharacterType(roleData: Partial<RoleData>) {
        const type = roleData[RoleDataKeyName.TEAM];

        const characterType = CharacterType.unsafeFrom(type);
        if (characterType === undefined) {
            throw new CannotDetermineCharacterType(undefined, this, type);
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
export type TownsfolkCharacterToken = CharacterToken & {
    characterType: Townsfolk;
};
export type OutsiderCharacterToken = CharacterToken & {
    characterType: Outsider;
};
export type MinionCharacterToken = CharacterToken & { characterType: Minion };
export type DemonCharacterToken = CharacterToken & { characterType: Demon };
export type TravellerCharacterToken = CharacterToken & {
    characterType: Traveller;
};
export type FabledCharacterToken = CharacterToken & { characterType: Fabled };

export const CharacterToID = (character: CharacterToken) => character.id;
export const CharactersToIDs = (characters: Array<CharacterToken>) =>
    characters.map(CharacterToID);
