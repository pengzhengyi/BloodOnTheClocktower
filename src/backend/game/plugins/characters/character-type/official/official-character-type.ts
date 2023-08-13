import type { CharacterAlignment } from '../../character-alignment/character-alignment';
import type { ICharacterType } from '../character-type';

/**
 * {@link `glossary["Type"]`}
 * A class of character—Townsfolk, Outsider, Minion, Demon, Traveller, or Fabled.
 */
export abstract class OfficialCharacterType implements ICharacterType {
    get id(): string {
        return this.name.toLowerCase();
    }

    abstract name: string;

    abstract alignment: CharacterAlignment;

    /**
     * A set of nicknames that can be used to refer to this character type.
     *
     * These names are unambiguous and can be used to identify this character type.
     *
     * By default, this set contains the character type's name, its ID, and its name in lowercase.
     */
    get acceptableNicknames(): Set<string> {
        return new Set([this.id, this.name, this.name.toLowerCase()]);
    }
}
