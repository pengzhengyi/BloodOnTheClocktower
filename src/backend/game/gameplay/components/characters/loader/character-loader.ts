import type { ILoader } from '../../../../../common/interfaces/loader';
import type { ICharacter } from '../character';
import type { CharacterId } from '../id/character-id';

export interface ICharacterLoader extends ILoader<CharacterId, ICharacter> {}
