import { Singleton } from '../../../../../../common/utils/singleton';
import { CharacterAlignment } from '../../character-alignment/character-alignment';
import { OfficialCharacterType } from './official-character-type';

class BaseTownsfolk extends OfficialCharacterType {
    get name(): string {
        return 'Townsfolk';
    }

    alignment: CharacterAlignment = CharacterAlignment.Good;
}

/**
 * {@link `glossary["Townsfolk"]`}
 * A type of good character. Townsfolk have abilities that help the good team. Usually, most in-play characters are Townsfolk. The Traveller sheet lists the number of Townsfolk in the current game.
 */
export const Townsfolk = Singleton<BaseTownsfolk, typeof BaseTownsfolk>(
    BaseTownsfolk
);
