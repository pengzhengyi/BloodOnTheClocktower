import { Singleton } from '../../../../../../common/utils/singleton';
import { CharacterAlignment } from '../../character-alignment/character-alignment';
import { OfficialCharacterType } from './official-character-type';

class BaseDemon extends OfficialCharacterType {
    get name(): string {
        return 'Demon';
    }

    alignment: CharacterAlignment = CharacterAlignment.Evil;

    get acceptableNicknames(): Set<string> {
        const nicknames = super.acceptableNicknames;
        nicknames.add('demons');
        return nicknames;
    }
}

/**
 * {@link `glossary["Demon"]`}
 * A type of character that begins evil. If the Demon dies, the good team wins. Demons usually kill players at night and have some other ability that harms the good team.
 */
export const Demon = Singleton<BaseDemon, typeof BaseDemon>(BaseDemon);
