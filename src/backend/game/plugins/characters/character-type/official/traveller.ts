import { Singleton } from '../../../../../common/utils/singleton';
import { CharacterAlignment } from '../../character-alignment/character-alignment';
import { OfficialCharacterType } from './official-character-type';

class BaseTraveller extends OfficialCharacterType {
    get name(): string {
        return 'Traveller';
    }

    alignment: CharacterAlignment = CharacterAlignment.Unknown;

    get acceptableNicknames(): Set<string> {
        const nicknames = super.acceptableNicknames;
        nicknames.add('travellers');
        return nicknames;
    }
}

/**
 * {@link `glossary["Traveller"]`}
 * A type of character for players who are late to join or who expect to leave early. The player chooses their character, and the Storyteller chooses their alignment. Travellers have great power, but may be exiled by the group.
 */
export const Traveller = Singleton<BaseTraveller, typeof BaseTraveller>(
    BaseTraveller
);
