import type { OneOfTwoPlayersIsMinion } from '../information';
import { OneOfTwoPlayersHasCharacterTypeInformationProvider } from './common';
import type { InfoProvideContext } from './provider';
import { CharacterType, Minion } from '~/game/character-type';

export type InvestigatorInformation = OneOfTwoPlayersIsMinion;

export class InvestigatorInformationProvider<
    TInfoProvideContext extends InfoProvideContext
> extends OneOfTwoPlayersHasCharacterTypeInformationProvider<
    TInfoProvideContext,
    InvestigatorInformation
> {
    protected expectedCharacterType: typeof CharacterType = Minion;
}
