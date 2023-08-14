import { Singleton } from '../../../../../common/utils/singleton';
import { CharacterAlignment } from '../../character-alignment/character-alignment';
import { OfficialCharacterType } from './official-character-type';

class BaseMinion extends OfficialCharacterType {
    get name(): string {
        return 'Minion';
    }

    alignment: CharacterAlignment = CharacterAlignment.Evil;

    get acceptableNicknames(): Set<string> {
        const nicknames = super.acceptableNicknames;
        nicknames.add('minions');
        return nicknames;
    }
}

/**
 * {@link `glossary["Minion"]`}
 * A type of character that begins evil. Minions have abilities that help the evil team. There are usually 1 to 3 Minions per game. The Traveller sheet lists the number of Minions in the current game.
 */
export const Minion = Singleton<BaseMinion, typeof BaseMinion>(BaseMinion);
