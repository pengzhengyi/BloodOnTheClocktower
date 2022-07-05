import { Alignment } from './alignment';
import { RoleData, RoleDataKeyName, WithStartsAsAlignment } from './types';

export abstract class CharacterType {
    protected static CHARACTER_TYPE_REGEX: RegExp;

    static getTeamRegex(team?: string): RegExp {
        if (team === undefined) {
            team = this.name;
        }
        return new RegExp(`${team}s?`, 'i');
    }

    static includes(roleData: Partial<RoleData>, regex?: RegExp): boolean {
        const team = roleData[RoleDataKeyName.TEAM];

        if (team === undefined) {
            return false;
        }

        return this.match(team, regex);
    }

    static of(roleData: Partial<RoleData>): typeof CharacterType | undefined {
        const team = roleData[RoleDataKeyName.TEAM];

        if (team === undefined) {
            return undefined;
        }

        // short circuiting with map
        const characterType = TEAM_CHARACTER_TYPES.get(team);
        if (characterType !== undefined) {
            return characterType;
        }

        return CHARACTER_TYPES.find((characterType) =>
            characterType.includes(roleData)
        );
    }

    static match(team: string, regex?: RegExp): boolean {
        regex =
            regex ||
            this.CHARACTER_TYPE_REGEX ||
            (this.CHARACTER_TYPE_REGEX = this.getTeamRegex());
        return regex.test(team);
    }
}

/**
 * {@link `glossory["Minion"]`}
 * A type of character that begins evil. Minions have abilities that help the evil team. There are usually 1 to 3 Minions per game. The Traveller sheet lists the number of Minions in the current game.
 */
export abstract class Minion
    extends CharacterType
    implements WithStartsAsAlignment
{
    get alignmentStartsAs() {
        return Alignment.Evil;
    }
}

/**
 * {@link `glossory["Demon"]`}
 * A type of character that begins evil. If the Demon dies, the good team wins. Demons usually kill players at night and have some other ability that harms the good team.
 */
export abstract class Demon
    extends CharacterType
    implements WithStartsAsAlignment
{
    get alignmentStartsAs() {
        return Alignment.Evil;
    }
}

/**
 * {@link `glossory["Townsfolk"]`}
 * A type of good character. Townsfolk have abilities that help the good team. Usually, most in-play characters are Townsfolk. The Traveller sheet lists the number of Townsfolk in the current game.
 */
export abstract class Townsfolk
    extends CharacterType
    implements WithStartsAsAlignment
{
    get alignmentStartsAs() {
        return Alignment.Good;
    }
}

/**
 * {@link `glossory["Outsider"]`}
 * A type of character that begins good. Outsiders have abilities that are unhelpful to the good team. The Traveller sheet lists how many Outsiders are in the current game.
 */
export abstract class Outsider
    extends CharacterType
    implements WithStartsAsAlignment
{
    get alignmentStartsAs() {
        return Alignment.Good;
    }
}

/**
 * {@link `glossory["Traveller"]`}
 * A type of character for players who are late to join or who expect to leave early. The player chooses their character, and the Storyteller chooses their alignment. Travellers have great power, but may be exiled by the group.
 */
export abstract class Traveller
    extends CharacterType
    implements WithStartsAsAlignment
{
    constructor(public alignmentStartsAs: Alignment) {
        super();
        this.alignmentStartsAs = alignmentStartsAs;
    }
}

/**
 * {@link `glossory["Fabled"]`}
 * A type of character for the Storyteller. Fabled characters are neutral, chosen by the Storyteller publicly, and usually make the game fairer in strange situations.
 */
export abstract class Fabled extends CharacterType {}

export const CHARACTER_TYPES: Array<typeof CharacterType> = [
    Minion,
    Demon,
    Townsfolk,
    Outsider,
    Fabled,
];
export const TEAM_CHARACTER_TYPES = new Map(
    CHARACTER_TYPES.map((characterType) => [
        characterType.name.toLowerCase(),
        characterType,
    ])
);
