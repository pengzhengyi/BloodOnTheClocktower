import { Singleton } from '../../../../../common/utils/singleton';
import { CharacterAlignment } from '../../character-alignment/character-alignment';
import { OfficialCharacterType } from './official-character-type';

class BaseFabled extends OfficialCharacterType {
    get name(): string {
        return 'Fabled';
    }

    alignment: CharacterAlignment = CharacterAlignment.Neutral;
}

/**
 * {@link `glossary["Fabled"]`}
 * A type of character for the Storyteller. Fabled characters are neutral, chosen by the Storyteller publicly, and usually make the game fairer in strange situations.
 */
export const Fabled = Singleton<BaseFabled, typeof BaseFabled>(BaseFabled);
