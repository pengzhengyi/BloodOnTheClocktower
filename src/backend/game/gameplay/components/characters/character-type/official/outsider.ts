import { Singleton } from '../../../../../../common/utils/singleton';
import { CharacterAlignment } from '../../character-alignment/character-alignment';
import { OfficialCharacterType } from './official-character-type';

class BaseOutsider extends OfficialCharacterType {
    get name(): string {
        return 'Outsider';
    }

    alignment: CharacterAlignment = CharacterAlignment.Good;

    get acceptableNicknames(): Set<string> {
        const nicknames = super.acceptableNicknames;
        nicknames.add('outsiders');
        return nicknames;
    }
}

/**
 * {@link `glossary["Outsider"]`}
 * A type of character that begins good. Outsiders have abilities that are unhelpful to the good team. The Traveller sheet lists how many Outsiders are in the current game.
 */
export const Outsider = Singleton<BaseOutsider, typeof BaseOutsider>(
    BaseOutsider
);
