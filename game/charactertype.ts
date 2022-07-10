import { Alignment } from './alignment';
import { NoMatchingCharacterType } from './exception';

/**
 * {@link `glossary["Type"]`}
 * A class of character—Townsfolk, Outsider, Minion, Demon, Traveller, or Fabled.
 */
export abstract class CharacterType {
    static includes(type?: string): boolean {
        if (type === undefined) {
            return false;
        }

        return TEAM_CHARACTER_TYPES.has(type);
    }

    static from(type?: string): typeof CharacterType {
        if (type === undefined) {
            throw new NoMatchingCharacterType(type);
        }

        // short circuiting with map
        const characterType = TEAM_CHARACTER_TYPES.get(type);
        if (characterType === undefined) {
            throw new NoMatchingCharacterType(type);
        }

        return characterType;
    }
}

/**
 * {@link `glossary["Minion"]`}
 * A type of character that begins evil. Minions have abilities that help the evil team. There are usually 1 to 3 Minions per game. The Traveller sheet lists the number of Minions in the current game.
 */
export abstract class Minion extends CharacterType {
    static defaultAlignment = Alignment.Evil;
}

/**
 * {@link `glossary["Demon"]`}
 * A type of character that begins evil. If the Demon dies, the good team wins. Demons usually kill players at night and have some other ability that harms the good team.
 */
export abstract class Demon extends CharacterType {
    static defaultAlignment = Alignment.Evil;
}

/**
 * {@link `glossary["Townsfolk"]`}
 * A type of good character. Townsfolk have abilities that help the good team. Usually, most in-play characters are Townsfolk. The Traveller sheet lists the number of Townsfolk in the current game.
 */
export abstract class Townsfolk extends CharacterType {
    static defaultAlignment = Alignment.Good;
}

/**
 * {@link `glossary["Outsider"]`}
 * A type of character that begins good. Outsiders have abilities that are unhelpful to the good team. The Traveller sheet lists how many Outsiders are in the current game.
 */
export abstract class Outsider extends CharacterType {
    static defaultAlignment = Alignment.Good;
}

/**
 * {@link `glossary["Traveller"]`}
 * A type of character for players who are late to join or who expect to leave early. The player chooses their character, and the Storyteller chooses their alignment. Travellers have great power, but may be exiled by the group.
 */
export abstract class Traveller extends CharacterType {}

/**
 * {@link `glossary["Fabled"]`}
 * A type of character for the Storyteller. Fabled characters are neutral, chosen by the Storyteller publicly, and usually make the game fairer in strange situations.
 */
export abstract class Fabled extends CharacterType {}

const CHARACTER_TYPES: Array<typeof CharacterType> = [
    Minion,
    Demon,
    Townsfolk,
    Outsider,
    Traveller,
    Fabled,
];
const TEAM_CHARACTER_TYPES = new Map(
    CHARACTER_TYPES.map((characterType) => [
        characterType.name.toLowerCase(),
        characterType,
    ])
);
