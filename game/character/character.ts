import { lowercaseLetters } from '../common';
import { CannotDetermineCharacterType } from '../exception/cannot-determine-character-type';
import { IncompleteCharacterRoleData } from '../exception/incomplete-character-role-data';
import type { TJSON } from '../types';
import { RoleDataKeyName, type RoleData, type ScriptCharacter } from '../types';
import type { CharacterId } from './character-id';
import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './character-type';

export interface ICharacter {
    readonly definition: Partial<RoleData>;

    /* basic properties */
    readonly id: CharacterId;
    readonly name: string;
    readonly characterType: typeof CharacterType;
    readonly firstNightOrder: number;
    readonly otherNightOrder: number;

    /* utility properties */
    readonly isMinion: boolean;
    readonly isDemon: boolean;
    readonly isTownsfolk: boolean;
    readonly isOutsider: boolean;
    readonly isTraveller: boolean;
    readonly isFabled: boolean;
    readonly isEvil: boolean;
    readonly isGood: boolean;

    /* utility methods */
    is(characterType: typeof CharacterType): boolean;

    toJSON(): TJSON;
    toString(): string;
    toScriptCharacter(): ScriptCharacter;
}

/**
 * {@link `glossary["Character"]`}
 * The role that a player plays, such as the Butler, as listed on the character sheet and character almanac for the chosen edition. Characters may be in play or not in play.
 */
export abstract class Character implements ICharacter {
    static REQUIRED_KEYNAMES = [
        RoleDataKeyName.NAME,
        RoleDataKeyName.TEAM,
        RoleDataKeyName.ABILITY,
    ];

    static getCanonicalId(name: string): CharacterId {
        return lowercaseLetters(name) as CharacterId;
    }

    declare characterType: typeof CharacterType;

    definition: Partial<RoleData>;

    get id() {
        const id = this.definition[RoleDataKeyName.ID];
        if (id === undefined) {
            throw new IncompleteCharacterRoleData(
                this.definition,
                RoleDataKeyName.ID
            );
        }
        return Character.getCanonicalId(id);
    }

    get name() {
        const name = this.definition[RoleDataKeyName.NAME];
        if (name === undefined) {
            throw new IncompleteCharacterRoleData(
                this.definition,
                RoleDataKeyName.NAME
            );
        }
        return name;
    }

    get firstNightOrder(): number {
        const order = this.definition[RoleDataKeyName.FIRSTNIGHT];
        if (order === undefined) {
            throw new IncompleteCharacterRoleData(
                this.definition,
                RoleDataKeyName.FIRSTNIGHT
            );
        }
        return order;
    }

    get otherNightOrder(): number {
        const order = this.definition[RoleDataKeyName.OTHERNIGHT];
        if (order === undefined) {
            throw new IncompleteCharacterRoleData(
                this.definition,
                RoleDataKeyName.OTHERNIGHT
            );
        }
        return order;
    }

    get isMinion() {
        return this.is(Minion);
    }

    get isDemon() {
        return this.is(Demon);
    }

    get isTownsfolk() {
        return this.is(Townsfolk);
    }

    get isOutsider() {
        return this.is(Outsider);
    }

    get isTraveller() {
        return this.is(Traveller);
    }

    get isFabled() {
        return this.is(Fabled);
    }

    get isEvil() {
        return this.isDemon || this.isMinion;
    }

    get isGood() {
        return this.isTownsfolk || this.isOutsider;
    }

    protected constructor(definition: Partial<RoleData>) {
        this.definition = definition;
        this.initialize(definition);
    }

    is(characterType: typeof CharacterType): boolean {
        return this.characterType.is(characterType);
    }

    toJSON(): string {
        return this.id;
    }

    toString() {
        return `${this.name}`;
    }

    toScriptCharacter(): ScriptCharacter {
        return { [RoleDataKeyName.ID]: this.toJSON() };
    }

    protected initialize(definition: Partial<RoleData>) {
        this.checkForRequiredKeyNames(definition);
        this.setCharacterType(definition);
    }

    protected checkForRequiredKeyNames(definition: Partial<RoleData>) {
        for (const requiredKeyName of Character.REQUIRED_KEYNAMES) {
            if (definition[requiredKeyName] === undefined) {
                throw new IncompleteCharacterRoleData(
                    definition,
                    requiredKeyName
                );
            }
        }
    }

    protected setCharacterType(definition: Partial<RoleData>) {
        const type = definition[RoleDataKeyName.TEAM];

        const characterType = CharacterType.unsafeFrom(type);
        if (characterType === undefined) {
            throw new CannotDetermineCharacterType(undefined, this, type);
        } else {
            this.characterType = characterType;
        }
    }
}

/**
 * {@link `glossary["Character token"]`}
 * The large round token that each player gets at the start of the game that indicates their character. Players cannot look at each other's character tokens.
 */
export type CharacterToken = ICharacter;
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
